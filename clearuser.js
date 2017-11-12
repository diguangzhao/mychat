var redis = require('redis')
	,REDIS_DNS = '172.17.42.1'
	,REDIS_PORT = '6379'
	,REDIS_OPT = {}
	,client = redis.createClient(REDIS_PORT, REDIS_DNS, REDIS_OPT);
var readline = require('readline');

client.on('ready', function(res){
	console.log('redis ready')
	var cursor = 0
	var setname 
	//创建readline接口实例
	var  rl = readline.createInterface({
	    input:process.stdin,
	    output:process.stdout
	});

	// question方法
	rl.question("请输入要清空的集合名: ",function(answer){
		setname = answer
	    console.log("SetName is "+answer);
	    console.log('===============================================')
	    if (setname) {
			clearUsers(setname, cursor)	
	    }
	    // 不加close，则不会结束
	});


	// while (cursor < 100) {
	// 	cursor++
	// 	client.sadd('users', cursor)
	// }
	// while (!cursor) {
	function clearUsers(setname, cursor) {
		client.sscan(setname, cursor, function(err, scan_data){
			var key = 0
			for (key in scan_data[1]) {
				console.log('删除' + setname + ': ' + scan_data[1][key] + ' ...')
				client.srem(setname, scan_data[1][key], function(err, res){
						console.log('成功')
				})
			}
			if (scan_data[0] !== "0") {
				cursor++
				clearUsers(setname, cursor)
			} else {
	    		rl.close();
			}
		})
	}

	rl.on("close", function(){
	    console.log('===============================================')
		console.log('执行结束')
	   // 结束程序
	    process.exit(0);
	});
})


