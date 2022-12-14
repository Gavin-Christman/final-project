//////////////////////
// This is the OCPP //
//////////////////////

import { WebSocketServer } from "ws"
import {Data} from "./models/data-model.js"
import {MongoClient} from "mongodb"
const port = 8080
const wss = new WebSocketServer({ port: port })

// Connecting to mongodb database
const url = "mongodb://mongo:27017/final-project"

let hasBeenBootNotif = false

wss.on("connection", (ws) => {
    console.log("THERE HAS BEEN A CONNECTION")

    ws.onmessage = (msg) => {
        let obj = JSON.parse(msg.data)

        console.log("THERE HAS BEEN A MESSAGE: ", obj)

        let messageType = obj[0]
        let messageId = obj[1]
        let action = obj[2]
        let payload = obj[3]

        if(messageType !== 2) return Error("The message is not supported")

        let isPayloadEmpty = (payloadValue, itemValue) => {
            if(!payloadValue) return itemValue
            return payloadValue
        }

        // SN is only sent after the BN is sent to the CP, HB is sent in a fixed schedule
        if(action === "BootNotification" && hasBeenBootNotif === false) {
            // IT IS INTERVAL (all lowercase) NOT HEARTBEATINTERVAL!!!!!
            ws.send(JSON.stringify([3, messageId, {currentTime: new Date().toISOString(), interval: 30, status: "Accepted"}]))

            MongoClient.connect(url, {useNewUrlParser: true}, (err, client) => {
                if (err) return console.log(err)

                let dataToSend = new Data({
                    bootNotif: {
                        // Required
                        chargePointVendor: payload.chargePointVendor, 
                        chargePointModel: payload.chargePointModel,
                        // Optional
                        chargeBoxSerialNumber: payload.chargeBoxSerialNumber,
                        chargePointSerialNumber: payload.chargePointSerialNumber,
                        firmwareVersion: payload.firmwareVersion,
                        iccid: payload.iccid,
                        imsi: payload.imsi,
                        meterType: payload.meterType
                    },
                    statusNotif:{
                        errorCode: "NoError",
                        timestamp: new Date().toISOString()
                    },
                    heartbeat: new Date().toISOString()
                })
                let addChargePoint = client.db("final-project").collection("data").insertOne(dataToSend)
            })
            hasBeenBootNotif === true
        } else if (action === "StatusNotification") {
            ws.send(JSON.stringify([3, messageId, {}]))
            MongoClient.connect(url, {useNewUrlParser: true}, (err, client) => {
                if (err) return console.log(err)
                
                let db = client.db("final-project").collection("data")
                db.findOne().then((item) => {
                    db.replaceOne({_id: item._id}, {
                    bootNotif: item.bootNotif,
                    heartbeat: item.heartbeat,
                    statusNotif: {
                        // Required
                        connectorId: isPayloadEmpty(payload.connectorId, item.statusNotif.connectorId), 
                        errorCode: isPayloadEmpty(payload.errorCode, item.statusNotif.errorCode), 
                        // Optional
                        info: isPayloadEmpty(payload.info, item.statusNotif.info), 
                        status: isPayloadEmpty(payload.status, item.statusNotif.status),
                        // apply isPayloadEmpty to timestamp, however insert isostring Date() instead of checking for DB value
                        // isPayloadEmpty(payload.timestamp, new Date().toISOString)
                        timestamp: new Date().toISOString(), 
                        vendorId: isPayloadEmpty(payload.vendorId, item.statusNotif.vendorId), 
                        vendorErrorCode: isPayloadEmpty(payload.vendorErrorCode, item.statusNotif.vendorErrorCode)
                    }}) 
                })
            })
            console.log("Status changed")
        } else if (action === "Heartbeat") {
            ws.send(JSON.stringify([3, messageId, {}]))

            MongoClient.connect(url, {useNewUrlParser: true}, (err, client) => {
                if (err) return console.log(err)

                let db = client.db("final-project").collection("data")
                db.findOne({}).then((item) => {
                    db.replaceOne({_id: item._id}, {bootNotif: item.bootNotif, 
                        statusNotif: item.statusNotif, 
                        heartbeat: new Date().toISOString()
                    }).catch((e) => console.log(e))
                })
            })
            console.log("Heartbeat changed")
        } else {
            ws.send(JSON.stringify([4, messageId, "NotImplemented", "The action has has not been implemented yet", {}]))
            return 
        }
    }

    ws.onerror = (err) => console.log(err)
    ws.onclose = () => console.log("THE CONNECTION HAS CLOSED")
})

/////////////////////////////////////////////////////////////
// The code below is from an earlier version of the script //
/////////////////////////////////////////////////////////////

// Add a new chargepoint
// MongoClient.connect(url, {useNewUrlParser: true}, (err, client) => {
//     if (err) return console.log(err)
//     addChargePoint = client.db("final-project").collection("data").insertOne(dataToSend)
// })

// // Get heartbeat to update every 60sec
// setInterval(() => {
//     MongoClient.connect(url, {useNewUrlParser: true}, (err, client) => {
//         if (err) return console.log(err)
//         let db = client.db("final-project").collection("data")
//         db.find({}).toArray().then(items => {
//             for(let i = 0; i < items.length; i++) {
//                 client.db("final-project").collection("data").updateOne({_id: items[i]._id}, {$set: {heartbeat: Date()}})
//             }
//         })
//     })
// }, 60000)

// // Update chargepoint data
// MongoClient.connect(url, {useNewUrlParser: true}, (err, client) => {
//     if (err) return console.log(err)
//     let db = client.db("final-project").collection("data")
    
//     db.findOne({_id : "636bf376356fd47bdaaed8dd"}).then(item => {
//         db.updateOne({_id : item._id}, {$set: {statusNotif: {connectors: [{
//             id: item.statusNotif.connectors[0].id,
//             connectorStatus: "Available",
//         }, {
//             id: item.statusNotif.connectors[1].id,
//             connectorStatus: "Available",
//         }, {
//             id: item.statusNotif.connectors[2].id,
//             connectorStatus: "SuspendedEV",
//         }],
//         lastUpdateAt: Date()
//     }}})
//     })
// })

///// This is a mock bootNotif /////
// [2,"19223201","BootNotification",{"chargePointVendor": "VendorX", "chargePointModel": "SingleSocketCharger", "chargePointSerialNumber": "8up6p70d12adrssgixy3h28d5", "chargeBoxSerialNumber": "lus6nyrnn77xonm20wbbjd23n", "firmwareVersion": "lus6nyrnn7q2hc83b65c954yp2tcrarvil020p557xonm20wbb", "iccid": "6irfqe68o7i31fanhai1", "imsi": "f2owium6849gh9fqr9j3", "meterSerialNumber": "d9nlhjegfkyhsk82gmpktua59","meterType": "0js31qhh23m4bexa0i5x2ebb7"}]

///// This is a mock statusNotif /////
// [2,"23458974","StatusNotification",{"connectorId": "1", "errorCode": "NoError", "info": "Updated Information", "status": "udoee28imkk8dkr4zjqm", "timestamp": "w2jm4ojxdwgk4h4xqg8i", "vendorId": "0zar6aagywyf9vymw13h", "vendorErrorCode": "9ax1a6tidfa31iw3l600"}]

///// This is a mock heartbeat /////
// [2,"75428903","Heartbeat", {}]