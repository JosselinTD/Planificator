$(function(){
	var taskDirective = function(){
		return {
			restrict: 'EA',
			replace: true,
			scope: {
				title:'=title',
				comment:'=comment',
				start:'=start',
				end:'=end',
				repeat:'=repeat'
			},
			controllerAs: 'task',
			controller: function(){
				this.editting = false;
			},
			link: function($scope, $element){
				console.log($element);
			},
			templateUrl:'task.html'
		};
	}
	
	angular.module("Task", [])
	.directive('TaskDirective', taskDirective)
	;

});