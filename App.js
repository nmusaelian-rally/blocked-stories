Ext.define('CustomApp', {
    extend: 'Rally.app.App',
    componentCls: 'app',
    scopeType: 'iteration',
    comboboxConfig: {
        labelWidth: 100,
        width: 300
    },
    launch: function() {
        var that = this;
        var iterationComboBox = Ext.create('Rally.ui.combobox.IterationComboBox',{
   		listeners:{
   			ready: function(combobox){
                                var iterationOid = combobox.getRecord().get('ObjectID'); //use OID of iteration with snapshot store , not ref
                                that._loadStories(iterationOid);
   			},
   			select: function(combobox){
                                var iterationOid = combobox.getRecord().get('ObjectID'); 
                                this._loadStories(iterationOid);
   			},
   			scope: this  
   		}
   	});
        this.add(iterationComboBox);
    },
    
    _loadStories:function(iterationOid){
        var snapshotStore = Ext.create('Rally.data.lookback.SnapshotStore', {
            autoLoad:true,
            find: {
                '_TypeHierarchy': 'HierarchicalRequirement',
                '_ProjectHierarchy': 12352608219,    
                '_PreviousValues.Blocked' : {$exists: true},
                Iteration: iterationOid
                
            },
            fetch: ['Name','FormattedID','ScheduleState','Blocked','_ValidFrom','_ValidTo', 'BlockedReason','PlanEstimate'], 
            order: 'OpenedDate DESC',
            hydrate: ['Blocked','ScheduleState'],
            compress: true,
            listeners: {
   		load: function(store,records,success){
   		    console.log("loaded %i records", records.length);
                    this._makeGrid(snapshotStore);
   		},
   		scope:this
   	    }
        });        
    },
    
    _makeGrid: function(snapshotStore){

//used  Ext.grid.Panel instead of Rally.ui.grid.Grid because rallygrid with snapshot causes error on rendering schedulestate image:   
//Uncaught TypeError: undefined is not a function sdk-debug.js:190539
//Ext.define.loadStates sdk-debug.js:190539

   	this._myGrid = Ext.create('Ext.grid.Panel', {
        //this._myGrid = Ext.create('Rally.ui.grid.Grid', {        
   	    store: snapshotStore,
   	    //columnCfgs: [ //used with rallygrid
            columns: [ //used with ext grid
                {text: 'ID', dataIndex: 'FormattedID', xtype: 'templatecolumn',
                    tpl: Ext.create('Rally.ui.renderer.template.FormattedIDTemplate')},
                {text: 'Name', dataIndex: 'Name'},
                {text: 'Blocked', dataIndex: 'Blocked'},
                {text: '_ValidFrom', dataIndex: '_ValidFrom', flex: 1},
                {text: '_ValidTo', dataIndex: '_ValidTo', flex: 1},
                {text: 'Schedule State', dataIndex: 'ScheduleState'},
                {text: 'Project', dataIndex: 'Project'},
   		],
   		height: 400
   	});
   	this.add(this._myGrid);
    }
});