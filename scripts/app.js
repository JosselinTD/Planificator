var	emptyTask = {
		id:-1,
		title:'',
		comment:'',
		start:'',
		end:'',
		repeat:0,
		editting:false,
		sync:false,
		error:false
	};
	
angular.module('Planificator', [])
.controller('RunningTaskCtrl', function(taskService){
	var ctrl = this;
	taskService.getTasks(function(datas){
		ctrl.tasks = datas;
	});
	
	this.propose = function(task){
		task.editting = false;
		task.error = false;
		task.sync = true;
		
		taskService.editTask(
			task,
			function(){
				task.sync = false;
			},
			function(){
				task.sync = false;
				task.error = true;
			}
		);
	};
})
.controller('NewTaskCtrl', function(taskService){
	var ctrl = this;
	ctrl.tasks = [];
	
	this.addTask = function(){
		ctrl.tasks.push($.extend({}, emptyTask, {editting:true}));
	};
	
	this.propose = function(task){
		task.editting = false;
		task.sync = true;
		taskService.addTask(
			task,
			function(){
				task.sync = false;
				for(var x = 0, y = ctrl.tasks.length; x < y; x++){
					if(ctrl.tasks[x].id === task.id){
						ctrl.tasks.splice(x, 1);
						break;
					}
				}
			},
			function(){
				task.sync = false;
				task.error = true;
			}
		);
	}
})
.directive('triggerDatepicker', function(){
	return function(scope, element, attrs){
		var date = $(element).find(".datepicker");
		date.datepicker();
		date.datepicker("option", "dateFormat", "dd-mm-yy");
	};
})
.service("taskService", ['$http', function($http){
	var tasks = [];
	this.getTasks = function(callback){
		if(tasks.length === 0){
			$http.get("api/task.php")
				.success(function(data){
					data.forEach(function(elem){
						tasks.push($.extend({}, emptyTask, elem));
					});
					callback(tasks);
				})
				.error(function(data, status, headers, config) {
				});
		} else {
			callback(tasks);
		}
	};
	
	this.getTask = function(id, callback){
		
	};
	
	this.addTask = function(task, success, error){
		$http.post("api/task.php", task)
			.success(function(data){
				task.id = data.id;
				tasks.push(task);
				success(task);
			})
			.error(function(){
				error(task);
			});
	};
	
	this.editTask = function(task, success, error){
		$http.post("api/task.php?id="+task.id, task)
			.success(function(data){
				success(task);
			})
			.error(function(){
				error(task);
			});
	};
	
	this.deleteTask = function(task, success, error){
		$http.delete("api/task.php?id="+task.id)
			.success(function(data){
				for(var x = 0, y = tasks.length; x < y; x++){
					if(tasks[x].id === task.id){
						tasks.splice(x, 1);
						break;
					}
				}
				success();
			})
			.error(function(data){
				error();
			});
	};
}]);
;