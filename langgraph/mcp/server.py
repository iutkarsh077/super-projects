from mcp.server.fastmcp import FastMCP

mcp = FastMCP("File Server")


@mcp.tool()
def get_file(filename: str) -> str:
    """Read a file."""

    with open(filename, "r") as file:
        return file.read()


if __name__ == "__main__":
    mcp.run()