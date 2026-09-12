from typing import Annotated
from typing_extensions import TypedDict
import operator

from langgraph.graph import StateGraph, START, END
from langgraph.types import Send


# --------------------------------
# 1. State
# --------------------------------

class State(TypedDict):
    documents: list[str]
    results: Annotated[list[str], operator.add]


# --------------------------------
# 2. Node that processes ONE document
# --------------------------------

def process_document(state):

    document = state["document"]

    print(f"Processing: {document}")

    return {
        "results": [
            f"Processed {document}"
        ]
    }


# --------------------------------
# 3. Fan-out function
# --------------------------------

def fan_out(state):

    return [
        Send(
            "process_document",
            {
                "document": document
            }
        )
        for document in state["documents"]
    ]


# --------------------------------
# 4. Create Graph
# --------------------------------

graph = StateGraph(State)


# Add the processing node
graph.add_node(
    "process_document",
    process_document
)


# START → fan_out → multiple process_document executions
graph.add_conditional_edges(
    START,
    fan_out
)


# process_document → END
graph.add_edge(
    "process_document",
    END
)


# --------------------------------
# 5. Compile
# --------------------------------

app = graph.compile()


# --------------------------------
# 6. Run
# --------------------------------

result = app.invoke({
    "documents": [
        "Document A",
        "Document B",
        "Document C"
    ],
    "results": []
})


# --------------------------------
# 7. Print result
# --------------------------------

print("\nFinal Results:")

for result in result["results"]:
    print(result)