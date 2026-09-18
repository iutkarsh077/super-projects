from langgraph.graph import START, END, StateGraph
from dotenv import load_dotenv
from langchain_core.tools import tool
from langchain_openai import ChatOpenAI
from typing import TypedDict, Annotated
import operator
from constant import orders
from langgraph.prebuilt import ToolNode
from langgraph.types import Command, interrupt
from langgraph.checkpoint.memory import InMemorySaver

# from IPython.display import Image

load_dotenv()


class State(TypedDict):
    messages: Annotated[list, operator.add]


llm = ChatOpenAI(model="gpt-5.4-mini")


def CheckOrderHelper(orderId):
    releventData = []

    for item in orders:
        if item["id"] == orderId:
            return item

    return None


@tool
def GetOrdersRecord(orderId):
    """It checks the order from a outer data and return the relevenat order"""
    order  = CheckOrderHelper(orderId)

    if not order:
        return "Order not found."

    return order


all_order_tools = [GetOrdersRecord]

llm_with_tools = llm.bind_tools(all_order_tools)


def OrderHandlingAgent(state: State):
    try:
        query = state["messages"]

        response = llm_with_tools.invoke(query)

        return {"messages": [response]}
    except Exception as e:
        print(e)


def shouldContinue(state: State):
    last_messages = state["messages"][-1]

    if last_messages.tool_calls:
        return "tools"

    return "end"


@tool
def Initiaterefund(order_id):
    """Work for Refund of amount for the orders"""
    orderDetails = CheckOrderHelper(order_id)
    amount = orderDetails["amount"]

    if amount > 10000:
        human_response = interrupt(
            {
                "type": "refund_approval",
                "order_id": order_id,
                "amount": amount,
                "message": f"Approve refund of ₹{amount}?",
            }
        )

        if (
            human_response == "y"
            or human_response == "yes"
            or human_response == "approved"
        ) and (orderDetails["paymentStatus"] != "paid"):
            return {
                "messages": [
                    f"Human refunded the order no. {order_id} of amount {orderDetails["amount"]} Rs."
                ]
            }
        else:
            return {"message": "Refund rejected by human."}

    if orderDetails["paymentStatus"] == "paid":
        return {
            "messages": [
                f"Refund started for order no. {order_id} of amount {orderDetails["amount"]} Rs."
            ]
        }

    return {
        "messages": [
            f"Sorry it is a cash on delievery order and the payment status is still {orderDetails["paymentStatus"]}, so we cant refund you"
        ]
    }


all_payment_tools = [Initiaterefund]
payment_llm = llm.bind_tools(all_payment_tools)


def PaymentHandlerAgent(state: State):
    try:
        query = state["messages"]

        response = payment_llm.invoke(query)

        return {"messages": [response]}

    except Exception as e:
        print(e)
        return {"messages": []}


def SupervisorAgent(state: State):
    messages = state["messages"]

    response = llm.invoke(
        [
            {
                "role": "system",
                "content": """
                You are the supervisor of a customer support system.

                You have two specialist agents.

                ORDER AGENT:
                - Get order details
                - Check order status
                - Check shipping information

                PAYMENT AGENT:
                - Handle payment related questions
                - Handle refund requests

                Decide which agent should handle the user's request.

                If the request is related to orders, choose ORDER.

                If the request is related to payment or refund, choose PAYMENT.

                Return ONLY one word:

                ORDER
                or
                PAYMENT
                """,
            },
            *messages,
        ]
    )

    decision = response.content.strip().upper()

    print("Decision is: ", decision)

    if decision == "PAYMENT":

        return Command(goto="payments")

    return Command(goto="orders")


def orderShouldContinue(state: State):

    last_message = state["messages"][-1]

    if last_message.tool_calls:

        return "order_tools"

    return "end"


def paymentShouldContinue(state: State):

    last_message = state["messages"][-1]

    if last_message.tool_calls:

        return "payment_tools"

    return "end"


graph = StateGraph(State)

graph.add_node("supervisor_agent", SupervisorAgent)

graph.add_node("orders", OrderHandlingAgent)
graph.add_node("order_tools", ToolNode(all_order_tools))

graph.add_node("payments", PaymentHandlerAgent)
graph.add_node("payment_tools", ToolNode(all_payment_tools))

graph.add_edge(START, "supervisor_agent")
graph.add_conditional_edges(
    "orders", orderShouldContinue, {"order_tools": "order_tools", "end": END}
)

graph.add_edge("order_tools", "orders")


graph.add_conditional_edges(
    "payments", paymentShouldContinue, {"payment_tools": "payment_tools", "end": END}
)

graph.add_edge("payment_tools", "payments")

checkpointer = InMemorySaver()

workflow = graph.compile(checkpointer=checkpointer)

# config = {"configurable": {"thread_id": "1"}}

# result = workflow.invoke(
#     {"messages": ["Can i get refund of order id ORD-1006?"]}, config=config
# )

# if "__interrupt__" in result:

#     human_answer = input("Approve refund? (yes/no): ")

#     result = workflow.invoke(Command(resume=human_answer), config=config)

# print(result["messages"][-1].content)
