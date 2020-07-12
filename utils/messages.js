const moment = require('moment');

const formatMessage = (username, msg) => {
    return {
        from: {
            name: username
        },
        message: msg,
        createdAt: moment().format('h:mm a')
    };
};

module.exports = formatMessage;
