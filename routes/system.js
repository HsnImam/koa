const fs = require('fs-extra');
const path = require('path');
const Promise = require('bluebird');
const checkDiskSpace = require('check-disk-space');
const request = require('request-promise');

module.exports = ({
    systemRouter
}) => {
    let getFileSizeInBytes = async (filename) => {
        const stats = await fs.lstat(filename);
        return {
            size: Math.round(stats.size / 1024),
            birthtime: stats.birthtime
        };
    }

    systemRouter.post(`/`, async (ctx, next) => {
        //ctx.query to get query param
        //ctx.params to get params
        //ctx.request.body to get the body
        console.log(ctx.request.body);
        let {
            directories
        } = ctx.request.body;
        let output = await Promise.reduce(directories, async (out, directory) => {
            let files = await fs.readdir(directory);
            let result = await Promise.reduce(files, async (r, filename) => {
                r[filename] = await getFileSizeInBytes(path.join(directory, filename));
                return r;
            }, {});
            out[directory] = result;
            return out;
        }, {});

        ctx.body = output;
    });

    systemRouter.post('/disk', async (ctx, next) => {
        let {
            directory
        } = ctx.request.body;

        let output = await checkDiskSpace(directory);
        let percentage = Math.round(output.free / (output.free + output.size) * 100);

        if (percentage < 90) {
            const response = await request({
                uri: `https://chatteron.io/api/mail`,
                method: `POST`,
                body: {
                    "mail": {
                        "html": `<p>Hey there,
                                        <br>
                                        <br>
                                    The disk space usage has exceeded the 90% limit. Please clean up space on the server otherwise working of the chat bot will be affected. <b>Jarvis will go down.</b>
                                    <br>
                                    <br>
                                    Regards,
                                    <br>
                                    Team Leena
                                    </p>`,
                        "subject": "Disk Usage Alert",
                        "to": `hassan@chatteron.io, sourav@leena.ai, khyati@leena.ai`,
                        "from": "info@chatteron.io"
                    }
                },
                json: true
            });
        }

        ctx.body = output;
    })
};