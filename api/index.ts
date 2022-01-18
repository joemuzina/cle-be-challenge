import { VercelRequest, VercelResponse } from "@vercel/node";
import { pitches } from "../data/Pitches";
import { playerOverviews } from "../data/PlayerOverviews";
import { playerDetails } from "../data/PlayerDetails";

let pitchList = {};
let playerList = {};

for (const index in pitches) {
    const pid = pitches[index].pitcherId.toString();
    if (pitchList[pid] == null) {
        pitchList[pid] = [];
        playerList[pid] = playerDetails.filter(function(e) { return e.playerId.toString() == pid })[0];
    }

    pitchList[pid].push(pitches[index]);
}

const endpoints = {
    pitches: function(headers) {
        if (!headers.pid)
            return {error: "This endpoint requires a 'pid' argument supplied in the req header."};
        else if (pitchList[headers.pid] === null)
            return {error: "No pitches found for player " + headers.pid};
        else
            return {pitches: pitchList[headers.pid]};
    },
    players: function(headers) {
        if (!headers.pid)
            return {players: playerOverviews};
        else if (playerList[headers.pid] === null)
            return {error: "No player found with ID " + headers.pid};
        else
            return {playerDetail: playerList[headers.pid]};
    }
}

export default (request: VercelRequest, response: VercelResponse) => {
    const callType = request.headers.calltype;
    if (!endpoints[callType] || !callType)
        return response.json({ error: "Bad or invalid call type specified in req header.. Valid types: " + (()=>{
            let res = "";
            for (const endpoint in endpoints)
                res += endpoint + " ";
            return res;
        })()})
    
    return response.json(endpoints[callType](request.headers));
};
