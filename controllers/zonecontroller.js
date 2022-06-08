const Zone = require('../models/zonemodel');
const Institute = require('../models/institutemodel');
const asyncHandler = require('express-async-handler');
const SHG = require('../models/shgmodel');
const addnewzone = asyncHandler(async (req, res, next) => {
    try {
        const { zone } = req.body;
        if (!zone) {
            return res.status(400).json({
                success: false,
                message: 'Zone name is required'
            });
        }
        const check = await Zone.findOne({ zonename: zone });
        if (check) {
            return res.status(400).json({
                success: false,
                error: 'Zone already exists'
            });
        }
        const newZone = new Zone({
            zonename: zone,
        });
        await newZone.save();
        res.status(201).json({
            success: true,
            data: newZone,
        });
    }
    catch (err) {
        console.log(err);
        res.status(500).json({
            success: false,
            error: "Internal server error!",
            message: err.message,
        });
    }
});

const addinstitutetozone = asyncHandler(async (req, res) => {
    try {
        const { zonename, instituteid } = req.body;
        if (!zonename || !instituteid) {
            return res.status(400).json({
                success: false,
                message: 'Zone name and Institute Id are required'
            });
        }
        const zone = await Zone.findOne({ zonename: zonename });
        if (!zone) {
            return res.status(400).json({
                success: false,
                message: 'Zone not found'
            });
        }
        const institute = await Institute.findById(instituteid);
        if (!institute) {
            return res.status(400).json({
                success: false,
                message: 'Institute not found'
            });
        }
        if (institute.zoneid) {
            return res.status(400).json({
                success: false,
                message: 'Institute already assigned to zone'
            });
        }
        const check = await Zone.findOne({
            zonename: zone.zonename,
            "institutes.instituteid": instituteid
        });
        if (check) {
            return res.status(400).json({
                success: false,
                error: 'Institute already exists in this zone'
            });
        }
        if (!zone.institutes) {
            zone.institutes = [];
        }
        zone.institutes.push({
            instituteid: instituteid,
            institutename: institute.name,
        });
        institute.zoneid = zone._id;
        institute.zonename = zone.zonename;
        await institute.save();
        await zone.save();
        res.status(201).json({
            success: true,
            data: zone,
        });
    }
    catch (err) {
        console.log(err);
        res.status(500).json({
            success: false,
            error: "Internal server error!",
            message: err.message,
        });
    }
});

const addshgtozone = asyncHandler(async (req, res) => {
    try {
        const { zonename, shgid } = req.body;
        if (!zonename || !shgid) {
            return res.status(400).json({
                success: false,
                message: 'Zone name and SHG Id are required'
            });
        }
        const zone = await Zone.findOne({ zonename: zonename });
        if (!zone) {
            return res.status(400).json({
                success: false,
                message: 'Zone not found'
            });
        }
        const shg = await SHG.findById(shgid);
        if (!shg) {
            return res.status(400).json({
                success: false,
                message: 'SHG not found'
            });
        }
        const check = await Zone.findOne({
            zonename: zone.zonename,
            "shgs.shgid": shgid
        });
        if (check) {
            return res.status(400).json({
                success: false,
                error: 'SHG already exists in this zone'
            });
        }
        if (!zone.shgs) {
            zone.shgs = [];
        }
        zone.shgs.push({
            shgid: shgid,
            shgname: shg.name,
        });
        if (!shg.zone) {
            shg.zone = [];
        }
        shg.zone.push({
            zoneid: zone._id,
            zonename: zone.zonename,
        });
        await shg.save();
        await zone.save();
        res.status(201).json({
            success: true,
            data: zone,
        });
    }
    catch (err) {
        console.log(err);
        res.status(500).json({
            success: false,
            error: "Internal server error!",
            message: err.message,
        });
    }
});

module.exports = {
    addnewzone,
    addinstitutetozone,
    addshgtozone,
}