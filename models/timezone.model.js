const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const timezoneSchema = new Schema(
    {
        country: {
            type: String,
            trim: true,
            required: true,
        },
        UTC: {
            type: String,
            trim: true,
            required: true,
        },
        Dst_start_day: {
            type: String,
            trim: true,
            enum: ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday", ""],
        },
        Dst_start_week: {
            type: String,
            trim: true,
            enum: ["first", "second", "third", "fourth", "last", ""],
        },
        Dst_start_month: {
            type: String,
            trim: true,
            enum: ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", ""],
        },
        Dst_start_add_hours: {
            type: String,
            trim: true,
        },
        Dst_stop_day: {
            type: String,
            trim: true,
            enum: ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday", ""],
        },
        Dst_stop_week: {
            type: String,
            trim: true,
            enum: ["first", "second", "third", "fourth", "last", ""],
        },
        Dst_stop_month: {
            type: String,
            trim: true,
            enum: ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", ""],
        },
        Dst_stop_sub_hours: {
            type: String,
            trim: true,
        },
    },
    {
        timestamps: true,
    }
);

// timezoneSchema.set("toObject", { virtuals: true });
// timezoneSchema.set("toJSON", { virtuals: true });


const Timezone = mongoose.model("Timezone", timezoneSchema);

module.exports = Timezone;
