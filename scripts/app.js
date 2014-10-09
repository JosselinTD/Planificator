var	taskDatas = [
		{
			'title':'Tache 1',
			'comment':'Commentaire 1',
			'start':'09-10-2014',
			'end':'20-10-2014',
			'repeat':0
		},
		{
			'title':'Tache 2',
			'comment':'Commentaire 2',
			'start':'015-10-2014',
			'end':'19-10-2014',
			'repeat':0
		},
		{
			'title':'Tache 3',
			'comment':'Commentaire 3',
			'start':'25-10-2014',
			'end':'10-11-2014',
			'repeat':0
		}
	];
	
angular.module('Planificator', [])
.controller('MainCtrl', function(){
	this.tasks = taskDatas;
})
.directive('triggerDatepicker', function(){
	return function(scope, element, attrs){
		var date = $(element).find(".datepicker");
		date.datepicker();
		date.datepicker("option", "dateFormat", "dd-mm-yy");
	};
});
;