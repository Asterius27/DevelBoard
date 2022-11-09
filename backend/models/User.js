module.exports = {
    userid: {
        type: 'uuid',
        primary: true
    },
    username: {
        type: "string",
        unique: true,
        index: true,

    },
    password: {
        type: "string"
    }
  }