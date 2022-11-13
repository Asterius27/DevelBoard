module.exports = {
    id: {
        type: 'uuid',
        primary: true
    },
    title: {
        type: "string",
        unique: true,
        index: true
    },
    path: {
        type: "string"
    },
    expireDate: {
        type: "dateTime"
    }
}