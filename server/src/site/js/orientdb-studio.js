/*
 * Copyright 1999-2010 Luca Garulli (l.garulli--at--orientechnologies.com)
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// GLOBAL VARIABLES
var startTime = 0; // CONTAINS THE LAST EXECUTION TIME
var databaseInfo; // CONTAINS THE DB INFO
var classEnumeration; // CONTAINS THE DB CLASSES
var selectedClassName; // CONTAINS LATEST SELECTED CLASS NAME
var orientServer;
var queryEditor;
var commandEditor;
var graphEditor;

function connect() {
	if (orientServer == null) {
		orientServer = new ODatabase($('#server').val() + '/'
				+ $('#database').val());
	}
	databaseInfo = orientServer.open();
	if (databaseInfo == null) {
		jQuery("#output").text(orientServer.getErrorMessage());
	} else {
		showDatabaseInfo();

		$("#tabs-main").show(200);
		$("#buttonConnect").hide();
		$("#buttonDisconnect").show();
	}
}

function disconnect() {
	if (orientServer == null) {
		orientServer = new ODatabase;
		orientServer.setDatabaseUrl($('#server').val());
		orientServer.setDatabaseName($('#database').val());
		orientServer.close();
	}
	$("#tabs-main").hide(200);
	$("#buttonConnect").show();
	$("#buttonDisconnect").hide();
}

function loadDocument(rid, level) {
	if (rid == null)
		return null;

	// LAZY LOAD IT
	var node = orientServer.load(rid, "*:" + (level + 5));
	if (node == null)
		return null;

	return graphEditor.document2node(node);
}

function showDatabaseInfo() {
	fillDynaTable($('#databaseClusters'), "Clusters", [ 'id', 'name', 'type',
			'records', 'size', 'filled', 'maxSize', 'files' ], [ {
		name : 'id',
		index : 'id',
		width : '30px',
		editable : false
	}, {
		name : 'name',
		index : 'name',
		width : '100px',
		editable : false
	}, {
		name : 'type',
		index : 'type',
		width : '80px',
		editable : false
	}, {
		name : 'records',
		index : 'records',
		width : '80px',
		editable : false
	}, {
		name : 'size',
		index : 'size',
		width : '80px',
		editable : false
	}, {
		name : 'filled',
		index : 'filled',
		width : '80px',
		editable : false
	}, {
		name : 'maxSize',
		index : 'maxSize',
		width : '80px',
		editable : false
	}, {
		name : 'files',
		index : 'files',
		width : '450px',
		editable : false
	} ], databaseInfo['clusters'], {
		sortname : 'id',
		editurl : getStudioURL('clusters')
	});

	$("#addPhysicalCluster").click(function() {
		jQuery("#databaseClusters").jqGrid('editGridRow', "newp", {
			height : 320,
			reloadAfterSubmit : false,
			closeOnEscape : true,
			closeAfterAdd : true,
			editData : [ selectedClassName ],
			afterSubmit : function(response, postdata) {
				jQuery("#output").val(response.responseText);
				return true;
			}
		});
	});
	$("#addLogicalCluster").click(function() {
		jQuery("#databaseClusters").jqGrid('editGridRow', "newl", {
			height : 320,
			reloadAfterSubmit : false,
			closeOnEscape : true,
			closeAfterAdd : true,
			editData : [ selectedClassName ],
			afterSubmit : function(response, postdata) {
				jQuery("#output").val(response.responseText);
				return true;
			}
		});
	});
	$("#removeCluster").click(
			function() {
				var selectedRow = jQuery("#databaseClusters").jqGrid(
						'getGridParam', 'selrow');
				if (selectedRow != null) {
					jQuery("#databaseClusters").jqGrid(
							'delGridRow',
							selectedRow,
							{
								reloadAfterSubmit : false,
								closeOnEscape : true,
								delData : [ selectedClassName ],
								afterSubmit : function(response, postdata) {
									jQuery("#output")
											.val(response.responseText);
									return [ true, response.responseText ];
								}
							});
				} else
					alert("Please select the cluster to delete!");
			});

	fillDynaTable($('#databaseDataSegments'), "Data Segments", [ 'id', 'name',
			'size', 'filled', 'maxSize', 'files' ], [ {
		name : 'id',
		index : 'id',
		width : '30px',
		editable : false
	}, {
		name : 'name',
		index : 'name',
		width : '100px',
		editable : false
	}, {
		name : 'size',
		index : 'size',
		width : '80px',
		editable : false
	}, {
		name : 'filled',
		index : 'filled',
		width : '80px',
		editable : false
	}, {
		name : 'maxSize',
		index : 'maxSize',
		width : '80px',
		editable : false
	}, {
		name : 'files',
		index : 'files',
		width : '600px',
		editable : false
	} ], databaseInfo['dataSegments'], {
		height : '40px'
	});

	fillDynaTable($('#databaseTxSegment'), "Tx Segment", [ 'totalLogs', 'size',
			'filled', 'maxSize', 'file' ], [ {
		name : 'totalLogs',
		index : 'Total Logs',
		width : '100px',
		editable : false
	}, {
		name : 'size',
		index : 'Size',
		width : '80px',
		editable : false
	}, {
		name : 'filled',
		index : 'Filled',
		width : '80px',
		editable : false
	}, {
		name : 'maxSize',
		index : 'Max Size',
		width : '80px',
		editable : false
	}, {
		name : 'file',
		index : 'File',
		width : '600px',
		editable : false
	} ], databaseInfo['txSegment'], {
		height : '25px'
	});

	fillDynaTable($('#databaseUsers'), "Users", [ 'name', 'roles' ], null,
			databaseInfo['users']);
	fillDynaTable($('#databaseRolesRules'), "Rules", [ 'Name', 'Create',
			'Read', 'Update', 'Delete' ], [ {
		name : 'name',
		index : 'name',
		formatter : 'text',
		edittype : 'text',
		editable : false
	}, {
		name : 'create',
		index : 'create',
		formatter : 'checkbox',
		edittype : 'checkbox',
		editable : true
	}, {
		name : 'read',
		index : 'read',
		formatter : 'checkbox',
		edittype : 'checkbox',
		editable : true
	}, {
		name : 'update',
		index : 'update',
		formatter : 'checkbox',
		edittype : 'checkbox',
		editable : true
	}, {
		name : 'delete',
		index : 'delete',
		formatter : 'checkbox',
		edittype : 'checkbox',
		editable : true
	} ], null);
	fillDynaTable($('#databaseRoles'), "Roles", [ 'name', 'mode' ], null,
			databaseInfo['roles'], {
				sortname : 'name',
				onSelectRow : function(roleRowNum) {
					var role = databaseInfo['roles'][roleRowNum - 1];
					fillDynaTableRows($('#databaseRolesRules'), role.rules);
				}
			});

	classEnumeration = ":;";
	for (cls in databaseInfo['classes']) {
		if (classEnumeration.length > 2)
			classEnumeration += ";";
		classEnumeration += databaseInfo['classes'][cls].name + ":"
				+ databaseInfo['classes'][cls].name;
	}

	jQuery($('#classProperties')).jqGrid('GridUnload');
	fillDynaTable(
			$('#classProperties'),
			"Properties",
			[ 'id', 'name', 'type', 'linkedType', 'linkedClass', 'mandatory',
					'notNull', 'min', 'max', 'indexed' ],
			[
					{
						name : 'id',
						index : 'id',
						width : 30
					},
					{
						name : 'name',
						index : 'name',
						width : 180,
						editable : true,
						editrules : {
							required : true
						},
						formoptions : {
							elmprefix : '(*)'
						}
					},
					{
						name : 'type',
						index : 'type',
						width : 100,
						edittype : "select",
						editoptions : {
							value : ":;BINARY:BINARY;BOOLEAN:BOOLEAN;EMBEDDED:EMBEDDED;EMBEDDEDLIST:EMBEDDEDLIST;EMBEDDEDMAP:EMBEDDEDMAP;EMBEDDEDSET:EMBEDDEDSET;FLOAT:FLOAT;DATE:DATE;DOUBLE:DOUBLE;INTEGER:INTEGER;LINK:LINK;LINKLIST:LINKLIST;LINKMAP:LINKMAP;LINKSET:LINKSET;LONG:LONG;SHORT:SHORT;STRING:STRING"
						},
						editable : true,
						editrules : {
							required : true
						},
						formoptions : {
							elmprefix : '(*)'
						}
					},
					{
						name : 'linkedType',
						index : 'linkedType',
						width : 150,
						edittype : "select",
						editoptions : {
							value : ":;BINARY:BINARY;BOOLEAN:BOOLEAN;EMBEDDED:EMBEDDED;EMBEDDEDLIST:EMBEDDEDLIST;EMBEDDEDMAP:EMBEDDEDMAP;EMBEDDEDSET:EMBEDDEDSET;FLOAT:FLOAT;DATE:DATE;DOUBLE:DOUBLE;INTEGER:INTEGER;LINK:LINK;LINKLIST:LINKLIST;LINKMAP:LINKMAP;LINKSET:LINKSET;LONG:LONG;SHORT:SHORT;STRING:STRING"
						},
						editable : true
					}, {
						name : 'linkedClass',
						index : 'linkedClass',
						width : 150,
						edittype : "select",
						editoptions : {
							value : classEnumeration
						},
						editable : true
					}, {
						name : 'mandatory',
						index : 'mandatory',
						width : 90,
						formatter : 'checkbox',
						edittype : 'checkbox',
						editable : true
					}, {
						name : 'notNull',
						index : 'notNull',
						width : 80,
						formatter : 'checkbox',
						edittype : 'checkbox',
						editable : true
					}, {
						name : 'min',
						index : 'min',
						width : 120,
						editable : true
					}, {
						name : 'max',
						index : 'max',
						width : 120,
						editable : true
					}, {
						name : 'indexed',
						index : 'indexed',
						width : 80,
						edittype : "select",
						editoptions : {
							value : ":;Unique:Unique;Not unique:Not Unique"
						},
						editable : true
					} ], null, {
				editurl : getStudioURL('classProperties'),
				sortname : 'id'
			});

	$("#addProperty").click(function() {
		jQuery("#classProperties").jqGrid('editGridRow', "new", {
			height : 320,
			reloadAfterSubmit : false,
			closeOnEscape : true,
			closeAfterAdd : true,
			editData : [ selectedClassName ],
			afterSubmit : function(response, postdata) {
				jQuery("#output").val(response.responseText);
				return true;
			}
		});
	});
	$("#deleteProperty").click(
			function() {
				var selectedRow = jQuery("#classProperties").jqGrid(
						'getGridParam', 'selrow');
				if (selectedRow != null) {
					var propName = jQuery('#classProperties').jqGrid(
							'getRowData', selectedRow)["name"];
					jQuery("#classProperties").jqGrid(
							'delGridRow',
							selectedRow,
							{
								reloadAfterSubmit : false,
								closeOnEscape : true,
								delData : [ selectedClassName, propName ],
								afterSubmit : function(response, postdata) {
									jQuery("#output")
											.val(response.responseText);
									return [ true, response.responseText ];
								}
							});
				} else
					alert("Please select the property to delete!");
			});

	fillDynaTable($('#databaseClasses'), "Classes", [ 'id', 'name', 'clusters',
			'defaultCluster', 'records' ], [ {
		name : 'id',
		index : 'id',
		width : 30
	}, {
		name : 'name',
		index : 'name',
		width : 280,
		editable : true,
		editrules : {
			required : true
		},
		formoptions : {
			elmprefix : '(*)'
		}
	}, {
		name : 'clusters',
		index : 'clusters',
		width : 80,
		editable : false
	}, {
		name : 'defaultCluster',
		index : 'defaultCluster',
		width : 80,
		editable : false
	}, {
		name : 'records',
		index : 'records',
		width : 150,
		editable : false
	} ], databaseInfo['classes'], {
		sortname : 'id',
		editurl : getStudioURL('classes'),
		onSelectRow : function(classRowNum) {
			selectedClassName = databaseInfo['classes'][classRowNum - 1].name;
			fillDynaTableRows($('#classProperties'),
					databaseInfo['classes'][classRowNum - 1]['properties']);
		}
	});

	$("#addClass").click(function() {
		jQuery("#databaseClasses").jqGrid('editGridRow', "new", {
			height : 320,
			reloadAfterSubmit : false,
			closeOnEscape : true,
			closeAfterAdd : true,
			editData : [ selectedClassName ],
			afterSubmit : function(response, postdata) {
				jQuery("#output").val(response.responseText);
				return true;
			}
		});
	});
	$("#deleteClass").click(
			function() {
				var selectedRow = jQuery("#databaseClasses").jqGrid(
						'getGridParam', 'selrow');
				if (selectedRow != null) {
					jQuery("#databaseClasses").jqGrid(
							'delGridRow',
							selectedRow,
							{
								reloadAfterSubmit : false,
								closeOnEscape : true,
								delData : [ selectedClassName ],
								afterSubmit : function(response, postdata) {
									jQuery("#output")
											.val(response.responseText);
									return [ true, response.responseText ];
								}
							});
				} else
					alert("Please select the class to delete!");
			});

	fillDynaTable($('#databaseConfig'), "Configuration", [ 'name', 'value' ],
			null, databaseInfo['config'].values, {
				sortname : 'name'
			});

	fillDynaTable($('#databaseConfigProperties'), "Configuration properties", [
			'name', 'value' ], null, databaseInfo['config'].properties, {
		sortname : 'name'
	});
}

function queryResponse(data) {
	displayResultSet(data["result"], data["schema"]);
}

function executeQuery() {
	startTimer();

	var code = queryEditor.getCode();
	queryEditor.setCode(jQuery.trim(code));

	queryResult = orientServer.query(code + "/" + $('#limit').val());

	if (queryResult == null) {
		jQuery("#output").text(orientServer.getErrorMessage());
	} else {
		queryResponse(queryResult);
	}
}

function executeCommand() {
	startTimer();

	var code = commandEditor.getCode();
	commandEditor.setCode(jQuery.trim(code));

	commandResult = orientServer.executeCommand(code);

	if (commandResult == null) {
		commandOutputEditor.setCode('')
		jQuery("#output").text(orientServer.getErrorMessage());
	} else {
		commandOutputEditor.setCode(commandResult);
		jQuery("#output").val("Command executed in " + stopTimer() + " sec.");
	}
}

function executeRawCommand() {
	startTimer();

	var code = rawEditor.getCode();

	var req = $('#server').val() + '/' + $('#rawOperation').val();
	if ($('#rawDatabase').val() != null && $('#rawDatabase').val().length > 0)
		req += '/' + $('#rawDatabase').val();
	if ($('#rawArgs').val() != null && $('#rawArgs').val().length > 0)
		req += '/' + $('#rawArgs').val();

	$.ajax({
		type : $('#rawMethod').val(),
		url : req,
		success : function(msg) {
			rawEditor.setCode(msg);
			rawEditor.reindent();
			jQuery("#output").val(
					"Raw command executed in " + stopTimer() + " sec.");
		},
		data : code,
		error : function(msg) {
			rawEditor.setCode("");
			jQuery("#output").val("Command response: " + msg);
		}
	});
}

function startTimer() {
	startTime = new Date().getTime();
}

function stopTimer() {
	return ((new Date().getTime() - startTime) / 1000);
}

function clearResultset() {
	jQuery("#queryResultTable").jqGrid('clearGridData');
}

function getStudioURL(context) {
	return $('#server').val() + '/studio/' + $('#database').val() + '/'
			+ context;
}

function askServerInfo() {
	serverInfo = orientServer.serverInfo();
	if (serverInfo == null) {
		jQuery("#output").val(orientServer.getErrorMessage());
	} else {
		writeServerInfo(serverInfo);
	}
}

function writeServerInfo(server) {
	fillStaticTable($('#serverConnections'), [ 'Id', 'Remote Client',
			'Database', 'User', 'Protocol', 'Total requests', 'Command info',
			'Command detail', 'Last Command When', 'Last command info',
			'Last command detail', 'Last execution time', 'Total working time',
			'Connected since' ], server['connections']);
	fillStaticTable($('#serverDbs'),
			[ 'Database', 'User', 'Status', 'Storage' ], server['dbs']);
	fillStaticTable($('#serverStorages'), [ 'Name', 'Type', 'Path',
			'Active users' ], server['storages']);
	fillStaticTable($('#serverConfigProperties'), [ 'Name', 'Value' ],
			server['properties']);

	fillStaticTable($('#serverProfilerCounters'), [ 'Name', 'Value' ],
			server['profiler']['counters']);
	fillStaticTable($('#serverProfilerStats'), [ 'Name', 'Total',
			'Average Elapsed (ms)', 'Min Elapsed (ms)', 'Max Elapsed (ms)',
			'Last Elapsed (ms)', 'Total Elapsed (ms)' ],
			server['profiler']['stats']);
	fillStaticTable($('#serverProfilerChronos'), [ 'Name', 'Total',
			'Average Elapsed (ms)', 'Min Elapsed (ms)', 'Max Elapsed (ms)',
			'Last Elapsed (ms)', 'Total Elapsed (ms)' ],
			server['profiler']['chronos']);
}

function askDatabaseInfo() {
	databaseInfo = orientServer.getDatabaseInfo();
	if (databaseInfo == null) {
		jQuery("#output").text(orientServer.getErrorMessage());
	} else {
		showDatabaseInfo();
	}
}

function clear(component) {
	$('#' + component).val("");
}

function formatServerURL() {
	var s = $('#server').val();
	var index = s.indexOf('/', 8); // JUMP HTTP://
	if (index > -1)
		$('#server').val(s.substring(0, index));

	$('#rawServer').html($('#server').val() + "/");
}

jQuery(document)
		.ready(
				function() {
					jQuery(document).ajaxError(
							function(event, request, settings, err) {
								jQuery("#output").val(
										"Error: " + request.responseText);
							});

					$("#database").blur(function() {
						$('#rawDatabase').val($("#database").val());
					});

					$("#tabs-main").hide();
					$("#buttonDisconnect").hide();

					$("#tabs-main").tabs();
					$("#tabs-db").tabs();
					$("#tabs-security").tabs();
					$("#tabs-server").tabs();

					$('#server').change(formatServerURL);
					$('#server').val(document.location.href);
					formatServerURL();

					jQuery("#output").val(jQuery.trim(jQuery("#output").val()));

					jQuery("#queryText").val(
							(jQuery.trim(jQuery("#queryText").val())));
					queryEditor = CodeMirror.fromTextArea('queryText', {
						width : "920px",
						height : "60px",
						parserfile : "parsesql.js",
						stylesheet : "styles/codemirror/sqlcolors.css",
						path : "www/js/codemirror/",
						textWrapping : false
					});

					jQuery("#commandText").val(
							(jQuery.trim(jQuery("#commandText").val())));
					commandEditor = CodeMirror.fromTextArea('commandText', {
						width : "920px",
						height : "150px",
						parserfile : "parsesql.js",
						stylesheet : "styles/codemirror/sqlcolors.css",
						path : "www/js/codemirror/",
						textWrapping : false
					});

					commandOutputEditor = CodeMirror.fromTextArea(
							'commandOutput', {
								width : "920px",
								height : "250px",
								parserfile : [ "tokenizejavascript.js",
										"parsejavascript.js" ],
								stylesheet : "styles/codemirror/jscolors.css",
								path : "www/js/codemirror/",
								textWrapping : true,
								json : true
							});

					rawEditor = CodeMirror.fromTextArea('rawOutput', {
						width : "920px",
						height : "350px",
						parserfile : [ "tokenizejavascript.js",
								"parsejavascript.js" ],
						stylesheet : "styles/codemirror/jscolors.css",
						path : "www/js/codemirror/",
						textWrapping : true,
						json : true
					});

					$("#graphRecord")
							.click(
									function() {
										var selectedRow = jQuery(
												"#queryResultTable").jqGrid(
												'getGridParam', 'selrow');
										if (selectedRow != null)
											displayGraph(queryResult.result[selectedRow]);
									});

					$("#graphCommandResult")
							.click(
									function() {
										var result = orientServer
												.getCommandResult();

										if (result != null)
											displayGraph(result.result != null ? result.result[0]
													: result);
									});
					$("#graphRaw")
							.click(
									function() {
										var raw = rawEditor.getCode();
										if (raw == null || raw.length == 0)
											return;

										try {
											var result = jQuery.parseJSON(raw);
											if (result != null)
												displayGraph(result.result != null ? result.result[0]
														: result);
										} catch (e) {
											alert("Error on parsing result:"
													+ e);
										}
									});
				});

function displayGraph(selObject) {
	$("#tabs-main").tabs('select', "tab-graph");

	if (graphEditor == null)
		graphEditor = new OGraph(selObject, 'graphPanel');
	else
		graphEditor.render(selObject);
}
