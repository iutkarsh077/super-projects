import React from "react";

const Child = React.memo((isSelectedAll)=> {

    console.log("is selected all: ", isSelectedAll);
    return (
        <div>
            This is a child component
        </div>
    )
})


export default Child