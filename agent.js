'use strict';
const WebpackVueCliDevServer = require('./lib/webpack-vuecli-dev-server');
module.exports = class agentServerBoot {
    constructor(agent) {
        this.agent = agent;
    }

    async didReady() {
        const { agent } = this;
        const config = agent.config.webpackVueDevServer;
        agent.messenger.setMaxListeners(config.maxListeners || 10000);
        new WebpackVueCliDevServer(config, agent).fork();
    }
};
