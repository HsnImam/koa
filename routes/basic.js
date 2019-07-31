const Sentiment = require("Sentiment");

const sentiment = new Sentiment();

module.exports = ({
    router
}) => {
    // getting the home route
    router.get('/', (ctx, next) => {
        console.log(ctx);
        ctx.body = "Hello World";
    });

    // Analyze a text and return sentiment score in the range of -1 to 1
    function analyze(text) {
        const result = sentiment.analyze(text);
        console.log(result);
        const comp = result.comparative;
        const out = comp / 5;
        return out;
    }

    router.post('/analyze', (ctx, next) => {
        const text = ctx.request.body.text;
        if (text) {
            // Analyze the given text
            const score = analyze(text);
            // Send response
            ctx.body = {
                text,
                score
            };
        } else {
            // Send error if there's not text property on the body
            ctx.status = 400;
            ctx.body = {
                "error": "Please provide a text to analyze"
            };
        }
    });
};