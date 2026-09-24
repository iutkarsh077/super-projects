import crypto from "node:crypto";

const servers = ["server-1", "server-2", "server-3"]

let serverList = []
const virtual_nodes  = 100;

function hashValue(hashKey){
    const result = crypto.createHash('md5').update(hashKey).digest("hex");

    return parseInt(result.substring(0, 8), 16) % 1000
}

function getServerPosition(){
    for(let server of servers){
        for(let i = 0; i < virtual_nodes; i++){
            const node = `${server}:${i}`
            const position = hashValue(node);
            const data = {
                name: server,
                node,
                position
            }

            serverList.push(data)
        }
    }

    serverList.sort((a, b)=> a.position - b.position)
}


function GetServer(key){
    let unqiuePosition = hashValue(key);

    for(let i = 0; i < serverList.length; i++){
        if(unqiuePosition < serverList[i].position){
            return serverList[i].name
        }
    }

    return serverList[0].name
}

getServerPosition()

console.log(GetServer("dkkhiuwyuyy88"));


for(let i = 0; i < serverList.length; i++){
    console.log(serverList[i])
}