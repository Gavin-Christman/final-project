import mongoose from "mongoose"

// May need to have seperate model for each notif
// Data entry automatically gets assigned an ID because of mongo
// Holy shit do I need to overhaul this
const DataSchema = ({
    // OCPP PDF page 60
    bootNotif: {
        chargeBoxSerialNumber: {
            type: String,
            maxlength: 25,
            minlength: 0
        },
        chargePointModel: {
            type: String,
            required: true,
            minlength: 0,
            maxlength: 20,
        },
        chargePointSerialNumber: {
            type: String,
            minlength: 0,
            maxlength: 25,
        },
        chargePointVendor: {
            type: String,
            required: true,
            minlength: 0,
            maxlength: 20,
        }, 
        firmwareVersion: {
            type: String,
            minlength: 0,
            maxlength: 50,
        },
        iccid: {
            type: String,
            minlength: 0,
            maxlength: 20,
        },
        imsi: {
            type: String,
            minlength: 0,
            maxlength: 20,
        },
        meterSerialNumber: {
            type: String,
            minlength: 25,
            maxlength: 0,
        },
        meterType: {
            type: String,
            minlength: 0,
            maxlength: 25,
        }
    },
    // OCPP PDF page 71
    statusNotif: {
        connectorId: {
            type: Number,
            required: true,
            min: 0
        },
        errorCode: {
            type: String,
            enum: ["ConnectorLockFailure","EVCommunicationError","GroundFailure","HighTemperature",
            "InternalError","LocallistConflict","NoError","OtherError","OverCurrentFailure","OverVoltage",
            "PowerMeterfailure","PowerSwitchFailure","ReaderFailure","ResetFailure","UnderVoltage","WeakSignal"],
            required: true,
        }, 
        info: {
            type: String,
            minlength: 0,
            maxlength: 50,
        },
        status: {
            // Is it a string or an object?
            type: String,
            minlength: 0,
            maxlength: 50
        },
        timestamp: {
            type: String,
            required: true
        },
        vendorId: {
            type: String,
            minlength: 0,
            maxlength: 255
        },
        vendorErrorCode: {
            type: String,
            minlength: 0,
            maxlength: 50
        }
    },
    // OCPP PDf page 67
    heartbeat: {
        type: String, 
        required: true
    }
})

export const Data = mongoose.model("Data", DataSchema)