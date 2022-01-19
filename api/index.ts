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

module.exports = (request: VercelRequest, response: VercelResponse) => {
    let charPos = request.url.indexOf('?') + 1;
    const paramsStr = request.url.substring(charPos, request.url.length);
    charPos = 0;
    let params = {};

    while (charPos < paramsStr.length) {
        let endOfParamPos = paramsStr.indexOf('&', charPos);
        if (endOfParamPos == -1)
            endOfParamPos = paramsStr.length;

        let endOfKeyPos = paramsStr.indexOf('=', charPos);
        let key = paramsStr.substring(charPos, endOfKeyPos);
        let val = paramsStr.substring(endOfKeyPos + 1, endOfParamPos)
        params[key] = val;
        charPos = endOfParamPos + 1;
    }

    const callType = params['calltype'];
    if (!endpoints[callType] || !callType)
        return response.json({ error: "Bad or invalid call type specified in req header.. Valid types: " + (()=>{
            let res = "";
            for (const endpoint in endpoints)
                res += endpoint + " ";
            return res;
        })()})
    
    response.setHeader('Access-Control-Allow-Credentials', 'true');
    response.setHeader('Access-Control-Allow-Origin', '*');
    response.status(200).send(endpoints[callType](params));
};
