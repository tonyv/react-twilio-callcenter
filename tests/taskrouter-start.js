let sm = require("serial-mocha");
let taskFiles = ["./tests/taskrouter/internal-transfer-call.spec.js",
                 "./tests/taskrouter/remove-all-tasks.spec.js",
                 "./tests/taskrouter/inbound-cc-call.spec.js",
                 "./tests/taskrouter/remove-all-tasks.spec.js",
                 "./tests/taskrouter/inbound-sales-call.spec.js",
                 "./tests/taskrouter/remove-all-tasks.spec.js",
                 "./tests/taskrouter/internal-transfer-call.spec.js",
                 "./tests/taskrouter/remove-all-tasks.spec.js",
                 "./tests/taskrouter/transfer-to-agent-on-outbound-call.spec.js",
                 "./tests/taskrouter/remove-all-tasks.spec.js",
                 "./tests/taskrouter/voicemail.spec.js",
                 "./tests/taskrouter/remove-all-tasks.spec.js",
                 "./tests/taskrouter/outbound-call.spec.js",
                 "./tests/taskrouter/remove-all-tasks.spec.js"];

sm.runTasks(taskFiles,null,"./tests/reports")
	.then((results)=>{
	})
	.catch((err)=>console.log(err));
