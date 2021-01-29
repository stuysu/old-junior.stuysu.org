module.exports = {
    CreateError: (__code, __error) => {
        return {
            status: Number(__code),
            error: true,
            message: __error,
        };
    },
};
