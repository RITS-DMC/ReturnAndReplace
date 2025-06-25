var oWebController;
var sfcTreeReq;
var opTreeReq;
var bomType;
var bom;
var componentGlbl;
var componentGlblVersion
var compIdForInv;
var fragmentName;
var selectedTabIndex;
sap.ui.define([
    'jquery.sap.global',
    "sap/dm/dme/podfoundation/controller/PluginViewController",
    "sap/ui/model/json/JSONModel",
    'sap/ui/core/library',
    "sap/ui/core/Fragment",
    "sap/m/Input",
    "sap/m/TextArea",
    "sap/m/ObjectAttribute",
    'sap/m/MessageToast'
], function (jQuery, PluginViewController, JSONModel, coreLibrary, Fragment, Input, TextArea, ObjectAttribute,MessageToast) {
    "use strict";

    return PluginViewController.extend("rits.custom.plugins.returnandreplace.returnandreplace.controller.MainView", {
        onInit: function () {
            PluginViewController.prototype.onInit.apply(this, arguments);



        },
        onAfterRendering: function () {
            oWebController = this;
            selectedTabIndex=0;
            /*  this.getView().byId("backButton").setVisible(this.getConfiguration().backButtonVisible);
              this.getView().byId("closeButton").setVisible(this.getConfiguration().closeButtonVisible);
              
              this.getView().byId("headerTitle").setText(this.getConfiguration().title);
              this.getView().byId("textPlugin").setText(this.getConfiguration().text); */

            setTimeout(function () {
                oWebController.onLoad();

            }, 5000);


        },
        onBeforeRenderingPlugin: function () {



        },
        onLoad: function () {
            var rData;
            var oModel = new sap.ui.model.json.JSONModel();
            var sHeaders = { "DataServiceVersion": "2.0", "Accept": "application/json" };
            oModel.loadData(oWebController.getPublicApiRestDataSourceUri() + "/sfc/v1/worklist/sfcs", { "plant": plant }, true, "GET", null, false, sHeaders);
            oModel.attachRequestCompleted(function (oEvent) {
                var oData = oEvent.getSource().oData;
                console.log(oData);
                rData = oData;
                // var resourceNames = [];
                // for (var i = 0; i < oData.length; i++) {
                //     resourceNames.push(oData[i].resource);
                // }
                // resourceNames.sort();
                // var rsrc = new sap.ui.model.json.JSONModel(resourceNames);
                // var comboBoxModel = new sap.ui.model.json.JSONModel(oData);
                // var comboBox = oWebController.getView().byId("rsrsId");
                // comboBox.setModel(comboBoxModel);
                // var oItemTemplate = new sap.ui.core.Item({
                //     key: '{description}', 
                //     text: '{resource}' 
                // });
                //  comboBox.bindItems("/", oItemTemplate);
                //  comboBox.bindItems("/", oItemTemplate);
                //  oWebController.getView().byId("rsrsId").setValue('6S1');//(oData[0].resource);
                //oWebController.getView().byId("rsrsId").setValue(resourceNames[0].resource);
                //oWebController.getView().setModel(dataModel, "resource");
                //oWebController.getView().byId("rsrsId").setValue("6S1");
                var sfcModel = new sap.ui.model.json.JSONModel({ sfcList: oData });
                oWebController.getView().setModel(sfcModel, "sfcModel");

            });

            console.log(rData);


        },
        retrieveSFCDetails: function () {
            var visibility=oWebController.getView().byId("panelId02").getVisible();
            if(visibility==false)
            {
                oWebController.getView().byId("panelId02").setVisible(true);
            }
            opTreeReq = "MY_OP_R10162"
            var sfcReq = oWebController.getView().byId("InputValueHelp").getValue();
            if (sfcReq == "") {
                return 0;
            }
            sfcTreeReq = sfcReq;

            var oModel = new sap.ui.model.json.JSONModel();
            var sHeaders = { "DataServiceVersion": "2.0", "Accept": "application/json" };
            oModel.loadData(oWebController.getPublicApiRestDataSourceUri() + "/sfc/v1/sfcdetail", { "plant": plant, "sfc": sfcReq }, true, "GET", null, false, sHeaders);
            oModel.attachRequestCompleted(function (oEvent) {
                var oData = oEvent.getSource().oData;
                console.log(oData);
                oWebController.getView().byId("idSFC").setText(oData.sfc);
                oWebController.getView().byId("idShopOrder").setText(oData.order.order);
                oWebController.getView().byId("idStatus").setText(oData.status.description);
                oWebController.getView().byId("idMaterial").setText(oData.material.material);
                oWebController.getView().byId("idRevisionLevel").setText(oData.material.version);
                oWebController.getView().byId("idDescription").setText(oData.material.description);
                oWebController.getView().byId("idRouter").setText(oData.routing.routing);
                if(oData.bom != null)
                {
                oWebController.getView().byId("idbom").setText(oData.bom.bom);
                }
                oWebController.getView().byId("idQtyMain").setText(oData.quantity);


                
            });
            oWebController.loadTree(sfcTreeReq);
        },
        loadTree: function (SFC) {

            // sfcTreeReq = SFC;
            // opTreeReq = operation;
            // var bomData;
             //R_AND_R_PP_CPP_getSerializedComponents
             var myurl = this.getPublicApiRestDataSourceUri() + "/pe/api/v1/process/processDefinitions/start?key=REG_135e5745-5dd8-4815-ba91-cd0075799c93&async=false";

             this.ajaxPostRequest(myurl, { "InPlant": plant, "InSFC": SFC },
                 function (oResponseData) {
                     console.log(oResponseData);
                     var bomData = JSON.parse(oResponseData.plannedComponentsModefied);
                     var assyData = oResponseData.assembledData;
                      // Function to create tree nodes recursively
                    function createTreeNode(name,componentVersion,sfc,bom, description, remainingQuantity, operation, plannedQty, assembledQty, assyDatafields, assembledDate, children, bomArray, assyArray) {
                        const node = {
                            name: name,
                            componentVersion:componentVersion,
                            sfc:sfc,
                            bom:bom,
                            description: description,
                            operation: operation,
                            plannedQty: plannedQty,
                            remainingQuantity: remainingQuantity,
                            assembledQty: assembledQty,
                            assemblyDataFields: assyDatafields,
                            assyDate: assembledDate,
                            children: []
                        };

                        if (assyDatafields && assyDatafields.length > 0) {
                            var assDataString = "";
                            for (var n = 0; n < assyDatafields.length; n++) {
                                if (n == 0) {
                                    assDataString = assDataString + assyDatafields[n].fieldName + ":" + assyDatafields[n].fieldValue;
                                }
                                else {
                                    assDataString = assDataString + "," + assyDatafields[n].fieldName + ":" + assyDatafields[n].fieldValue;
                                }
                            }
                            node["assemblyData"] = assDataString;
                        }

                        if (children && children.length > 0) {
                            children.forEach(child => {
                                var childrenArra = [];
                                var assyDatafields;
                                for (var j = 0; j < assyArray.length; j++) {
                                    if (child.component == assyArray[j].component) {
                                        childrenArra.push(assyArray[j]);
                                        //   if(assyArray[j].assemblyDataFields.length>0)
                                        //    {
                                        //        assyDatafields=assyArray[j].assemblyDataFields;
                                        //      for(var k=0;k<assyData[j].assemblyDataFields.length;k++)
                                        //      {
                                               
                                        //        if(assyData[j].assemblyDataFields[k].fieldName=="INVENTORY_ID_SFC")
                                        //        {
                                        //            // oWebController.loadTree(assyData[j].assemblyDataFields[k].fieldValue,"OPERATION_162");
                                                   
                                        //        }
                                        //      } 
                                        //    } 
                                        assyArray.splice(j, 1);
                                        j = j - 1;
                                    }

                                }

                                const childNode = createTreeNode("Component:" + child.component,child.componentVersion,child.sfc,child.bom, child.componentDescription, child.remainingQuantity, child.operationActivity, child.requiredQuantity, child.assembledQuantity, child.assemblyDataFields, child.assembledDate, childrenArra, bomArray, assyArray);
                                node.children.push(childNode);
                            });
                        }
                        if (assyDatafields && assyDatafields.length > 0) {
                            for (var n = 0; n < assyDatafields.length; n++) {

                                if (assyDatafields[n].fieldName == "INVENTORY_ID_SFC") {
                                    // oWebController.loadSFCNode(assyDatafields[n].fieldValue,"OPERATION_162");
                                    // var childsfcData=oWebController.getView().getModel("oSfcNodeModel").getData();
                                    // console.log(childsfcData);
                                    // oWebController.loadTree(assyDatafields[n].fieldValue,"OPERATION_162");
                                    var resultPromise = oWebController.loadSFCNode(assyDatafields[n].fieldValue); 
                                                                    
                                    resultPromise.then(function(result) {
                                        var childBomData=JSON.parse(result.plannedComponentsModefied);
                                        var childAssyData=result.assembledData;
                                        var nodeName = "SFC:" + result.outSfc;
                                        var sfc;
                                        var componentVersion;
                                        var bom;
                                        var compArray = [];
                                        var remainingQuantity;
                                        var operation;
                                        var plannedQty;
                                        var assembledQty;
                                        var assembledDate;
                                        var description;
                                        var assyDatafields;
                                        if (childBomData != undefined) {
                                            for (var i = 0; i < childBomData.length; i++) {
                                                if (childBomData[i].assemblyDataType != "NONE") {
                                                    compArray.push(childBomData[i]);
                                                }
                    
                                            }
                    
                    
                                            const childNode =createTreeNode(nodeName,componentVersion,sfc,bom,description, remainingQuantity, operation, plannedQty, assembledQty, assyDatafields, assembledDate, compArray, childBomData, childAssyData);
                                            node.children.push(childNode);
                                            
                    
                                        }
                                        
                                    }).catch(function(error) {
                                        // Handle errors from the AJAX request
                                        console.error(error);
                                    });

                                }
                            }


                        }

                        return node;
                    }
                    
                    var nodeName = "SFC:" + sfcTreeReq;
                    var sfc;
                    var componentVersion;
                    var bom;
                    var compArray = [];
                    var nonSerCompArray=[];
                    var remainingQuantity;
                    var operation;
                    var plannedQty;
                    var assembledQty;
                    var assembledDate;
                    var description;
                    var assyDatafields;
                    if (bomData != undefined) {
                        for (var i = 0; i < bomData.length; i++) {
                            if (bomData[i].assemblyDataType != "NONE") {
                                compArray.push(bomData[i]);
                            }

                        }


                        var treeData = createTreeNode(nodeName,componentVersion,sfc,bom,description, remainingQuantity, operation, plannedQty, assembledQty, assyDatafields, assembledDate, compArray, bomData, assyData);
                        console.log(JSON.stringify(treeData));
                        var oModelforTreeTable = new sap.ui.model.json.JSONModel({ "tData": { "children": [treeData] } });
                        oWebController.getView().byId("treeTableId").setModel(oModelforTreeTable);

                        for (var j = 0; j < bomData.length; j++) {
                            if (bomData[j].assemblyDataType == "NONE") {
                                nonSerCompArray.push(bomData[j]);
                            }

                        }
                        var oModelforNonSerTable = new sap.ui.model.json.JSONModel( { "tableData": nonSerCompArray } );
                        oWebController.getView().byId("idNonserializedTable").setModel(oModelforNonSerTable);

                    }

                     
                 },
                 function (oError, sHttpErrorMessage) {
                     var err = oError || sHttpErrorMessage;
                     var ppModel = new sap.ui.model.json.JSONModel({"tData": { "children":[]}});
                     oWebController.getView().byId("treeTableId").setModel(ppModel);
                     var oModelforNonSerTable = new sap.ui.model.json.JSONModel( { "tableData": [] } );
                     oWebController.getView().byId("idNonserializedTable").setModel(oModelforNonSerTable);
                     console.log(err);
                 }
             );
           


        },
    
        loadSFCNode: function (SFC) {
            //R_AND_R_PP_CPP_getSerializedComponents
            var myurl = this.getPublicApiRestDataSourceUri() + "/pe/api/v1/process/processDefinitions/start?key=REG_135e5745-5dd8-4815-ba91-cd0075799c93&async=false";
            var ajaxPromise = new Promise(function (resolve, reject) {
                oWebController.ajaxPostRequest(myurl, { "InPlant": plant, "InSFC": SFC },
                function (oResponseData) {
                    console.log(oResponseData);
                    resolve(oResponseData);

                },
                function (oError, sHttpErrorMessage) {
                    var err = oError || sHttpErrorMessage;
                    reject(err);
                }
            );
            });
               
            // Return the ajaxPromise itself
            return ajaxPromise;
           

        },
        onRowSelectionChange: function (oEvent) {
            var oTreeTable = oEvent.getSource();
            var aSelectedIndices = oTreeTable.getSelectedIndices();
            var aSelectedItems = [];

            aSelectedIndices.forEach(function (iIndex) {
                // Assuming you have a JSONModel named 'yourModel'
                var oSelectedItem = oTreeTable.getContextByIndex(iIndex).getObject();
                aSelectedItems.push(oSelectedItem);
            });

            // 'aSelectedItems' now contains the selected rows' data
            console.log(aSelectedItems);
        },

        getMaterials: function () {
            var oModel = new sap.ui.model.json.JSONModel();
            var sHeaders = { "DataServiceVersion": "2.0", "Accept": "application/json" };
            oModel.loadData(oWebController.getPublicApiRestDataSourceUri() + "/api/v2/materials", { "plant": plant }, true, "GET", null, false, sHeaders);
            oModel.attachRequestCompleted(function (oEvent) {
                var oData = oEvent.getSource().oData;
                console.log(oData);
                oWebController.openMaterials(oData);

            });

        },

        openMaterials: function (resourceList) {

            var oValueHelpDialog = new sap.ui.comp.valuehelpdialog.ValueHelpDialog({
                title: i18nModel.getProperty("Materials"),
                supportMultiselect: false,
                supportRanges: false,
                supportRangesOnly: false,
                key: "",
                descriptionKey: "",
                contentHeight: "100%",
                ok: function (oControlEvent) {
                    oControllerForNC.getView().byId("MaterilasPopUp").setValue(oControlEvent.oSource._oSelectedItems.getModelData()[0].material);

                    oValueHelpDialog.close();
                    oValueHelpDialog.destroyContent();
                    oValueHelpDialog.destroy();
                },
                cancel: function (oControlEvent) {
                    oValueHelpDialog.close();
                    oValueHelpDialog.destroyContent();
                    oValueHelpDialog.destroy();
                }
            });
            var resource = new sap.m.Text().bindProperty("text", "resource");

            var description = new sap.m.Text().bindProperty("text", "description");

            var status = new sap.m.Text().bindProperty("text", "status");

            oValueHelpDialog.getTable().addColumn(new sap.ui.table.Column({
                label: new sap.m.Label({
                    text: i18nModel.getProperty("Resource")
                }),
                template: resource,
                sortProperty: "resource",
                filterProperty: "resource"
            }));

            oValueHelpDialog.getTable().addColumn(new sap.ui.table.Column({
                label: new sap.m.Label({
                    text: i18nModel.getProperty("Description")
                }),
                template: description,
                sortProperty: "description",
                filterProperty: "description"
            }));

            oValueHelpDialog.getTable().addColumn(new sap.ui.table.Column({
                label: new sap.m.Label({
                    text: "Status"
                }),
                template: status,
                sortProperty: "status",
                filterProperty: "status"
            }));
            var oRowsModel = new sap.ui.model.json.JSONModel();
            oRowsModel.setData(resourceList);
            oValueHelpDialog.getTable().setModel(oRowsModel);
            oValueHelpDialog.getTable().bindRows("/");
            oValueHelpDialog.open();


        },
        getShopOrders: function (oEvent) {
            var valueHelpInpId = oEvent.getSource().getId();
            var oModel = new sap.ui.model.json.JSONModel();
            var sHeaders = { "DataServiceVersion": "2.0", "Accept": "application/json" };
            oModel.loadData(oWebController.getPublicApiRestDataSourceUri() + "/sfc/v1/worklist/orders", { "plant": plant,"user":"dmc@ritsconsulting.com", "userName":"dmc@ritsconsulting.com","password":"Ritys@1234" }, true, "GET", null, false, sHeaders);
            oModel.attachRequestCompleted(function (oEvent) {
                var oData = oEvent.getSource().oData;
                console.log(oData);
                oWebController.openShopOrders(oData,valueHelpInpId)

            });
        },

        openShopOrders: function (shopOrderList,valueHelpInpId) {

            var oValueHelpDialog = new sap.ui.comp.valuehelpdialog.ValueHelpDialog({
                title: "ShopOrder",
                supportMultiselect: false,
                supportRanges: false,
                supportRangesOnly: false,
                key: "",
                descriptionKey: "",
                contentHeight: "100%",
                ok: function (oControlEvent) {
                    sap.ui.getCore().byId(valueHelpInpId).setValue(oControlEvent.oSource._oSelectedItems.getModelData()[0].order);

                    oValueHelpDialog.close();
                    oValueHelpDialog.destroyContent();
                    oValueHelpDialog.destroy();
                },
                cancel: function (oControlEvent) {
                    oValueHelpDialog.close();
                    oValueHelpDialog.destroyContent();
                    oValueHelpDialog.destroy();
                }
            });
            var order = new sap.m.Text().bindProperty("text", "order");

            // var description = new sap.m.Text().bindProperty("text", "description");

            var status = new sap.m.Text().bindProperty("text", "orderStatus");

            oValueHelpDialog.getTable().addColumn(new sap.ui.table.Column({
                label: new sap.m.Label({
                    text: "Shop Order"
                }),
                template: order,
                sortProperty: "order",
                filterProperty: "order"
            }));

            // oValueHelpDialog.getTable().addColumn(new sap.ui.table.Column({
            //     label: new sap.m.Label({
            //         text: i18nModel.getProperty("Description")
            //     }),
            //     template: description,
            //     sortProperty: "description",
            //     filterProperty: "description"
            // }));

            oValueHelpDialog.getTable().addColumn(new sap.ui.table.Column({
                label: new sap.m.Label({
                    text: "Status"
                }),
                template: status,
                sortProperty: "orderStatus",
                filterProperty: "orderStatus"
            }));
            var oRowsModel = new sap.ui.model.json.JSONModel();
            oRowsModel.setData(shopOrderList);
            oValueHelpDialog.getTable().setModel(oRowsModel);
            oValueHelpDialog.getTable().bindRows("/");
            oValueHelpDialog.open();


        },
        handleValueHelp: function () {
            /*  if (!this._valueHelpDialog) {
                  this._valueHelpDialog = new Fragment.load({
                      name: "rits.custom.plugins.returnandreplace.returnandreplace.view.sfcvaluehelp",
                      controller: this
                  }).then(function (oValueHelpDialog) {
                      this.getView().addDependent(oValueHelpDialog);
                      return oValueHelpDialog;
                  }.bind(this));
              }
  
              this._valueHelpDialog.then(function (oValueHelpDialog) {
                  oValueHelpDialog.open();
              }); */
            if (!this._valueHelpDialog) {
                Fragment.load({
                    name: "rits.custom.plugins.returnandreplace.returnandreplace.view.sfcvaluehelp",
                    controller: this
                }).then(function (oFragment) {
                    this._valueHelpDialog = new sap.m.Dialog({
                        title: "Value Help",
                        content: oFragment,
                        beginButton: new sap.m.Button({
                            text: "Close",
                            press: function () {
                                this._valueHelpDialog.close();
                            }.bind(this)
                        })
                    });

                    this.getView().addDependent(this._valueHelpDialog);
                    this._valueHelpDialog.open();
                }.bind(this));
            } else {
                this._valueHelpDialog.open();
            }
        },
        onValueHelpSelect: function () {
            sap.ui.getCore().byId("sfcTableId").getSelectedItems()[0].getBindingContext("sfcModel").getObject().sfc
            var oTable = sap.ui.getCore().byId("sfcTableId");
            var aSelectedItems = oTable.getSelectedItems();

            if (aSelectedItems.length > 0) {


                // Access data of the selected row
                var oSelectedSfc = aSelectedItems[0].getBindingContext("sfcModel").getObject().sfc;

                // Now, you can work with the data of the selected row
                console.log(oSelectedSfc);

                oWebController.getView().byId("InputValueHelp").setValue(oSelectedSfc);

                // Close the value help dialog
                this._valueHelpDialog.close();
            }
        },
        tabSelect: function (oEvent){
			 selectedTabIndex=oEvent.getParameters().tabIndex;

		},
        onOpenPopoverDialog: function () {
            var oTable;
            if(selectedTabIndex == 0)
            {
                oTable = oWebController.getView().byId("treeTableId");
            }
            else if(selectedTabIndex == 1)
            {
                oTable = oWebController.getView().byId("idNonserializedTable");
            }
            var aSelectedIndices = oTable.getSelectedIndices();
            fragmentName = "addFragment";

            if (!aSelectedIndices.length > 0 ) {
                MessageToast.show("Select a Component");
                return;
            }
            var aSelectedItems = [];

            aSelectedIndices.forEach(function (iIndex) {
                // Assuming you have a JSONModel named 'yourModel'
                var oSelectedItem = oTable.getContextByIndex(iIndex).getObject();
                aSelectedItems.push(oSelectedItem);
            });
            if (aSelectedItems[0].remainingQuantity != undefined) {
                if(aSelectedItems[0].remainingQuantity == 0)
                {
                    MessageToast.show("All Components are already assembled");
                    return;
                }
            }
            else {
                MessageToast.show("Select Parent Component");
                
                return;
            }
            // if(aSelectedItems[0].remainingQuantity == 0)
            // {
            //     alert("All Components are already assembled");

            // }

            // create dialog lazily
            if (!this.oMPDialog) {
                this.oMPDialog = this.loadFragment({
                    name: "rits.custom.plugins.returnandreplace.returnandreplace.view.addComponentPopUp"
                });
            }
            this.oMPDialog.then(function (oDialog) {
                this.oDialog = oDialog;
                this.oDialog.open();


                // var aSelectedItems = [];

                // aSelectedIndices.forEach(function (iIndex) {
                //     // Assuming you have a JSONModel named 'yourModel'
                //     var oSelectedItem = oTreeTable.getContextByIndex(iIndex).getObject();
                //     aSelectedItems.push(oSelectedItem);
                // });
                if(selectedTabIndex == 0){
                componentGlbl = aSelectedItems[0].name.split(":")[1];
                componentGlblVersion=aSelectedItems[0].componentVersion;
                if (aSelectedItems[0].remainingQuantity != undefined) {
                    compIdForInv=aSelectedItems[0].name.split(":")[1];
                    oWebController.getView().byId("addComponentId").setText(aSelectedItems[0].name.split(":")[1]);
                    oWebController.getView().byId("addComponentOperation").setText(aSelectedItems[0].operation);
                    oWebController.getView().byId("addComponentQuantity").setValue(aSelectedItems[0].remainingQuantity);
                    oWebController.getView().byId("addComponentSFC").setText(aSelectedItems[0].sfc);
                }
                else {
                    MessageToast.show("Select Parent Component");
                    return;
                }
                oWebController.loadAssyDataFieldDetails(aSelectedItems[0].bom);
            }
            else if(selectedTabIndex == 1)
            {
                componentGlbl = aSelectedItems[0].component;
                componentGlblVersion=aSelectedItems[0].componentVersion;
                oWebController.getView().byId("addComponentId").setText(aSelectedItems[0].component);
                    oWebController.getView().byId("addComponentOperation").setText(aSelectedItems[0].operationActivity);
                    oWebController.getView().byId("addComponentQuantity").setValue(aSelectedItems[0].remainingQuantity);
                    oWebController.getView().byId("addComponentSFC").setText(aSelectedItems[0].sfc);
                    oWebController.setTable([]);
            }



               
            }.bind(this));




        },
        onOpenPopoverDialogReplace: function () {
            var oTreeTable = oWebController.getView().byId("treeTableId");
            var aSelectedIndices = oTreeTable.getSelectedIndices();
            fragmentName = "replaceFragment";

            if (!aSelectedIndices.length > 0 ) {
                MessageToast.show("Select a Component");
                return;
            }
            var aSelectedItems = [];

            aSelectedIndices.forEach(function (iIndex) {
                // Assuming you have a JSONModel named 'yourModel'
                var oSelectedItem = oTreeTable.getContextByIndex(iIndex).getObject();
                aSelectedItems.push(oSelectedItem);
            });
            if (aSelectedItems[0].remainingQuantity != undefined) {
                if(aSelectedItems[0].remainingQuantity == aSelectedItems[0].plannedQty)
                {
                    MessageToast.show("Nothing is assembled to replace");
                    return;
                }
            }
            else {
                MessageToast.show("Select Parent Component");
                
                return;
            }
            // if(aSelectedItems[0].remainingQuantity == 0)
            // {
            //     alert("All Components are already assembled");

            // }

            // create dialog lazily
            if (!this.oMPDialogReplace) {
                this.oMPDialogReplace = this.loadFragment({
                    name: "rits.custom.plugins.returnandreplace.returnandreplace.view.replaceComponentPopUp"
                });
            }
            this.oMPDialogReplace.then(function (oDialogReplace) {
                this.oDialogReplace = oDialogReplace;
                this.oDialogReplace.open();


                // var aSelectedItems = [];

                // aSelectedIndices.forEach(function (iIndex) {
                //     // Assuming you have a JSONModel named 'yourModel'
                //     var oSelectedItem = oTreeTable.getContextByIndex(iIndex).getObject();
                //     aSelectedItems.push(oSelectedItem);
                // });
                componentGlbl = aSelectedItems[0].name.split(":")[1];
                componentGlblVersion=aSelectedItems[0].componentVersion;
                    compIdForInv=aSelectedItems[0].name.split(":")[1];
                    oWebController.getView().byId("replaceComponentId").setText(aSelectedItems[0].name.split(":")[1]);
                    oWebController.getView().byId("replaceComponentOperation").setText(aSelectedItems[0].operation);
                    oWebController.getView().byId("replaceComponentQuantity").setValue(aSelectedItems[0].remainingQuantity);
                    oWebController.getView().byId("replaceComponentSFC").setText(aSelectedItems[0].sfc);
                
                    oWebController.loadAssyDataFieldDetails(aSelectedItems[0].bom);
            }.bind(this));




        },
        onOpenPopoverDialogforRemove: function () {
            var oTreeTable = oWebController.getView().byId("treeTableId");
            var oTable;
            if(selectedTabIndex == 0)
            {
                oTable = oWebController.getView().byId("treeTableId");
            }
            else if(selectedTabIndex == 1)
            {
                oTable = oWebController.getView().byId("idNonserializedTable");
            }
            var aSelectedIndices = oTable.getSelectedIndices();
            fragmentName = "removeFragment";
            if (!aSelectedIndices.length > 0 ) {
                MessageToast.show("Select a Component");
                return;
            }
            var aSelectedItems = [];

            aSelectedIndices.forEach(function (iIndex) {
                // Assuming you have a JSONModel named 'yourModel'
                var oSelectedItem = oTable.getContextByIndex(iIndex).getObject();
                aSelectedItems.push(oSelectedItem);
            });
            if(selectedTabIndex == 0){
            if (aSelectedItems[0].remainingQuantity != undefined) {
                if(aSelectedItems[0].remainingQuantity == aSelectedItems[0].plannedQty)
                {
                    MessageToast.show("Component is not assembled to remove");
                    return;
                }
            }
            else {
                MessageToast.show("Select Parent Component");
                // alert("Select Parent Component");
                return;
            }
        } 
        else if(selectedTabIndex == 1)
        {
            if (aSelectedItems[0].remainingQuantity != undefined) {
                if(aSelectedItems[0].remainingQuantity == aSelectedItems[0].requiredQuantity)
                {
                    MessageToast.show("Component is not assembled to remove");
                    return;
                }
            }
        }

            // create dialog lazily
            if (!this.oMPDialogforremove) {
                this.oMPDialogforremove = this.loadFragment({
                    name: "rits.custom.plugins.returnandreplace.returnandreplace.view.removeComponentPopUp"
                });
            }
            this.oMPDialogforremove.then(function (oDialogRemove) {
                this.oDialogRemove = oDialogRemove;
                this.oDialogRemove.open();


                if(selectedTabIndex == 0)
                {
                componentGlbl = aSelectedItems[0].name.split(":")[1];
                componentGlblVersion=aSelectedItems[0].componentVersion;
                   
                        oWebController.getView().byId("removeComponentId").setText(aSelectedItems[0].name.split(":")[1]);
                        oWebController.getView().byId("removeComponentOperation").setText(aSelectedItems[0].operation);
                        // oWebController.getView().byId("removeComponentQuantity").setValue(aSelectedItems[0].remainingQuantity);
                        oWebController.getView().byId("removeComponentSFC").setText(aSelectedItems[0].sfc);
                }
                    
                else if(selectedTabIndex == 1)
            {
                componentGlbl = aSelectedItems[0].component;
                componentGlblVersion=aSelectedItems[0].componentVersion;
                   
                        oWebController.getView().byId("removeComponentId").setText(aSelectedItems[0].component);
                        oWebController.getView().byId("removeComponentOperation").setText(aSelectedItems[0].operationActivity);
                        // oWebController.getView().byId("removeComponentQuantity").setValue(aSelectedItems[0].remainingQuantity);
                        oWebController.getView().byId("removeComponentSFC").setText(aSelectedItems[0].sfc);
            }
                



                // oWebController.loadAssyDataFieldDetails();
            }.bind(this));




        },

        addComponent: function () {
            var componentName = oWebController.getView().byId("addComponentId").getText();
            var operation = oWebController.getView().byId("addComponentOperation").getText();
            var quantity = oWebController.getView().byId("addComponentQuantity").getValue();
            var sfc = oWebController.getView().byId("addComponentSFC").getText();
            var oData=oWebController.getView().byId("assyDataTable").getModel().getData();
            var assyDataFieldArray=[];

            var oDataArray=oData.yourData;
            if(oDataArray && oDataArray.length>0)
            {
            for(var i=0;i<oDataArray.length;i++)
            {
                var object={};
                object["fieldName"]=oDataArray[i].dataField;
                object["fieldValue"]=oDataArray[i].dataAttribute;
                assyDataFieldArray.push(object);
            }
             }

            var myurl = this.getPublicApiRestDataSourceUri() + "/pe/api/v1/process/processDefinitions/start?key=REG_354eef82-ba3d-4d4a-a3b4-e55ba1205c6e&async=false";

            this.ajaxPostRequest(myurl, { "InPlant": plant, "InOperation": operation, "InSFC": sfc, "InComponent": componentName, "InQuantity": quantity,"InAssyData":assyDataFieldArray },
                function (oResponseData) {
                    console.log(oResponseData);
                    var outMsg = oResponseData.ErrMsg;
                    if(outMsg=="INACTIVE")
                    {
                        MessageToast.show("SFC is not in Active status");
                    }
                    else
                    {
                        oWebController.loadTree(sfcTreeReq);
                    }
                    
                    oWebController.oDialog.close();

                },
                function (oError, sHttpErrorMessage) {
                    var err = oError || sHttpErrorMessage;
                    var ppModel = new sap.ui.model.json.JSONModel([]);
                    oWebController.getView().setModel(ppModel, "oSfcNodeModel");
                    MessageToast.show(sHttpErrorMessage+" "+err.details[0].httpResponseBody);
                    console.log(err);
                }
            );

        },
        replaceComponent: function () {
            var componentName = oWebController.getView().byId("replaceComponentId").getText();
            var operation = oWebController.getView().byId("replaceComponentOperation").getText();
            var quantity = oWebController.getView().byId("replaceComponentQuantity").getValue();
            var sfc = oWebController.getView().byId("replaceComponentSFC").getText();
            var oData=oWebController.getView().byId("assyDataTableReplace").getModel().getData();
            var assyDataFieldArray=[];

            var oDataArray=oData.yourData;
            if(oDataArray && oDataArray.length>0)
            {
            for(var i=0;i<oDataArray.length;i++)
            {
                var object={};
                object["fieldName"]=oDataArray[i].dataField;
                object["fieldValue"]=oDataArray[i].dataAttribute;
                assyDataFieldArray.push(object);
            }
        }

            var myurl = this.getPublicApiRestDataSourceUri() + "/pe/api/v1/process/processDefinitions/start?key=REG_d739ce16-d123-474e-b262-6ab5db528f93&async=false";

            this.ajaxPostRequest(myurl, { "InPlant": plant, "InOperation": operation, "InSFC": sfc, "InComponent": componentName, "InQuantity": quantity,"InAssyData":assyDataFieldArray },
                function (oResponseData) {
                    console.log(oResponseData);
                    var outMsg = oResponseData.ErrMsg;
                    if(outMsg=="INACTIVE")
                    {
                        MessageToast.show("SFC is not started");
                    }
                    else
                    {
                        oWebController.loadTree(sfcTreeReq);
                    }
                    oWebController.oDialogReplace.close();

                },
                function (oError, sHttpErrorMessage) {
                    var err = oError || sHttpErrorMessage;
                    var ppModel = new sap.ui.model.json.JSONModel([]);
                    oWebController.getView().setModel(ppModel, "oSfcNodeModel");
                    MessageToast.show(sHttpErrorMessage+" "+err.details[0].httpResponseBody);
                    console.log(err);
                }
            );

        },
        removeComponent: function () {
            var componentName = oWebController.getView().byId("removeComponentId").getText();
            var operation = oWebController.getView().byId("removeComponentOperation").getText();
            // var quantity=oWebController.getView().byId("removeComponentQuantity").getValue();
            var sfc = oWebController.getView().byId("removeComponentSFC").getText();

            var myurl = this.getPublicApiRestDataSourceUri() + "/pe/api/v1/process/processDefinitions/start?key=REG_4f4c8a1a-351c-4dac-b2eb-ae622e6123e5&async=false";

            this.ajaxPostRequest(myurl, { "InPlant": plant, "InOperation": operation, "InSFC": sfc, "InComponent": componentName },
                function (oResponseData) {
                    console.log(oResponseData);
                    var bomData = oResponseData;
                    oWebController.loadTree(sfcTreeReq);
                    oWebController.oDialogRemove.close();
                },
                function (oError, sHttpErrorMessage) {
                    var err = oError || sHttpErrorMessage;
                    var ppModel = new sap.ui.model.json.JSONModel([]);
                    oWebController.getView().setModel(ppModel, "oSfcNodeModel");
                    MessageToast.show(sHttpErrorMessage+" "+err.details[0].httpResponseBody);
                    console.log(err);
                }
            );
        },
        loadAssyDataFieldDetails: function (componentBom) {
            // alert("Value Help Requested!");
            // bom = "EX_BOM_01";
            var type;
            // var version = "A";
            if(componentBom.type=="USERBOM")
            {
                type = "MASTER";
            }
            var myurl = this.getPublicApiRestDataSourceUri() + "/pe/api/v1/process/processDefinitions/start?key=REG_8b53f48b-81e5-4512-b524-a5f02820474a&async=false";

            this.ajaxPostRequest(myurl, { "InPlant": plant, "InBom": componentBom.bom, "InType": type, "InVersion": componentBom.version,"InMaterial":componentGlbl,"InMaterialVersion":componentGlblVersion },
                function (oResponseData) {
                    console.log(oResponseData);
                    var bomData = oResponseData.OutBOM;
                    var componentList = bomData[0].components
                    var assyDataList;
                    var materialData=oResponseData.outMaterial;
                    // var assydataFields;

                    //Search component in BOM list and take assembly data list
                    for (var i = 0; i < componentList.length; i++) {
                        if (componentList[i].material.material == componentGlbl && componentList[i].assemblyDataType) {
                            assyDataList = componentList[i].assemblyDataType.dataFieldList;

                        }

                    }
                    if (assyDataList && assyDataList.length > 0) {
                        var assydataFields = [];
                        for (var i = 0; i < assyDataList.length; i++) {
                            var dataobject = { dataField: assyDataList[i].dataField.fieldName };
                            assydataFields.push(dataobject);
                        }
                        oWebController.setTable(assydataFields);
                    }
                    else {
                        assyDataList=materialData[0].assemblyDataType.dataFieldList;
                        var assydataFields = [];
                        for (var i = 0; i < assyDataList.length; i++) {
                            var dataobject = { dataField: assyDataList[i].dataField.fieldName };
                            assydataFields.push(dataobject);
                        }
                        oWebController.setTable(assydataFields);

                    }


                },
                function (oError, sHttpErrorMessage) {
                    var err = oError || sHttpErrorMessage;
                    var ppModel = new sap.ui.model.json.JSONModel([]);
                    oWebController.getView().setModel(ppModel, "oSfcNodeModel");
                    MessageToast.show(sHttpErrorMessage+" "+err.details[0].httpResponseBody);
                    console.log(err);
                }
            );
            /*  var oModel = new sap.ui.model.json.JSONModel();
              var sHeaders = { "DataServiceVersion": "2.0", "Accept": "application/json" };
              oModel.loadData(oWebController.getPublicApiRestDataSourceUri() + "/api/v1/boms", { "plant": plant,"bom":bom,"type":bomType,"version":"A","readReservationsAndBatch":true  }, true, "GET", null, false, sHeaders);
              oModel.attachRequestCompleted(function (oEvent) {
                  var oData = oEvent.getSource().oData;
                  console.log(oData);
                  var componentList=oData[0].components
                  var assyDataList;
                  var assydataFields;
                  
                  for(var i=0;i<componentList.length;i++)
                  {
                      if(componentList[i].material.material == 1231426 && componentList[i].assemblyDataType.dataType != "")
                      {
                          assyDataList=JSON.stringify(componentList[i].assemblyDataType.dataFieldList);
                          
                      }
                      
                  }
                  if(assydataFields && assydataFields.length>0)
                  {
                  var assydataFields=[];
                  for(var i=0;i<assyDataList.length;i++)
                  {
                      var dataobject={dataField:assyDataList[i].dataField.fieldName};
                      assydataFields.push(dataobject);
                  }
                  oWebController.setTable(assydataFields);
              }
              else{
                  var oModemat = new sap.ui.model.json.JSONModel();
                  var sHeaders = { "DataServiceVersion": "2.0", "Accept": "application/json" };
                  oModemat.loadData(oWebController.getPublicApiRestDataSourceUri() + "/sfc/v1/worklist/orders", { "plant": plant }, true, "GET", null, false, sHeaders);
                  oModemat.attachRequestCompleted(function (oEvent) {
                      var oData = oEvent.getSource().oData;
                      console.log(oData);
  
                      
                  }); 
  
              }
  
                  
              });  */


        },
        setTable: function (assydataFields) {
            var tableId;
            if (fragmentName == "addFragment") {
                tableId = "assyDataTable";
            }
            else if(fragmentName == "replaceFragment")
            {
                tableId = "assyDataTableReplace";
            }
            var oTable = oWebController.getView().byId(tableId);

            // Assuming your data is in a JSON model
            var oModel = new sap.ui.model.json.JSONModel({
                yourData: assydataFields
            });
            oTable.setModel(oModel);

            // Bind the items directly and use a factory function
            oTable.bindItems({
                path: '/yourData',
                factory: function (sId, oContext) {
                    var oData = oContext.getProperty();
                    var sType = "input"; // Default to Input, change as needed

                    // Determine the type based on the value of "dataField"
                    if (oData.dataField === "COMMENTS") {
                        sType = "textarea";
                    } else if (oData.dataField === "INVENTORY_ID_SFC") {
                        sType = "input";
                    }

                    var oCell;

                    if (sType === "input") {
                        oCell = new Input({
                            value: "{dataAttribute}",
                            showValueHelp: true,
                            valueHelpRequest: oWebController.invSFCValueHelp
                        });
                    } else if (sType === "textarea") {
                        oCell = new TextArea({
                            value: "{dataAttribute}",
                            liveChange: function (oEvent) {
                                // Update the model when the textarea value changes
                                oModel.setProperty(oContext.getPath() + "/dataAttribute", oEvent.getParameter("value"));
                            }
                        });
                    } else {
                        // Default to Input if no specific condition is met
                        oCell = new Input({
                            value: "{dataAttribute}",
                            valueHelpRequest: function () {
                                // Implement your value help logic here
                                alert("Value Help Requested!");
                            }
                        });
                    }

                    return new sap.m.ColumnListItem({
                        cells: [
                            new sap.m.Text({ text: "{dataField}" }),
                            oCell
                        ]
                    });
                }
            });
        },
        _closeDialog: function () {
            this.oDialog.close();
        },
        _closeDialogRemove: function () {
            this.oDialogRemove.close();
        },
        _closeDialogReplace: function () {
            this.oDialogReplace.close();
        },


        invSFCValueHelp: function (oEvent) {
            var valueHelpInpId = oEvent.getSource().getId();
            // sap.ui.getCore().byId(valueHelpInpId).getValue();
           
            // alert("Value Help Requested!");
            var myurl = oWebController.getPublicApiRestDataSourceUri() + "/pe/api/v1/process/processDefinitions/start?key=REG_6db19a26-22fd-4648-90ac-a271d7192fdf&async=false";

            oWebController.ajaxPostRequest(myurl, { "InPlant": plant, "InMaterial": compIdForInv },
                function (oResponseData) {
                    console.log(oResponseData);
                    var oData = oResponseData.outInventories;
                    oWebController.openInventories(oData, valueHelpInpId)
                },
                function (oError, sHttpErrorMessage) {
                    var err = oError || sHttpErrorMessage;
                    MessageToast.show(sHttpErrorMessage+" "+err.details[0].httpResponseBody);
                    console.log(err);
                }
            );
            // var oModel = new sap.ui.model.json.JSONModel();
            // var sHeaders = { "DataServiceVersion": "2.0", "Accept": "application/json" };
            // oModel.loadData(oWebController.getPublicApiRestDataSourceUri() + "/api/v1/inventories/advancedQuery", { "plant": plant, "material": compIdForInv, "materialVersion": "A" }, true, "GET", null, false, sHeaders);
            // oModel.attachRequestCompleted(function (oEvent) {
            //     var oData = oEvent.getSource().oData;
            //     console.log(oData);
            //     oWebController.openInventories(oData, valueHelpInpId)
            // });

        },
        openInventories: function (InventoryList, valueHelpInpId) {

            var oValueHelpDialog = new sap.ui.comp.valuehelpdialog.ValueHelpDialog({
                title: "Inventories",
                supportMultiselect: false,
                supportRanges: false,
                supportRangesOnly: false,
                key: "",
                descriptionKey: "",
                contentHeight: "100%",
                ok: function (oControlEvent) {
                    sap.ui.getCore().byId(valueHelpInpId).setValue(oControlEvent.oSource._oSelectedItems.getModelData()[0].inventoryId);

                    oValueHelpDialog.close();
                    oValueHelpDialog.destroyContent();
                    oValueHelpDialog.destroy();
                },
                cancel: function (oControlEvent) {
                    oValueHelpDialog.close();
                    oValueHelpDialog.destroyContent();
                    oValueHelpDialog.destroy();
                }
            });
            var inventoryId = new sap.m.Text().bindProperty("text", "inventoryId");

            var qty = new sap.m.Text().bindProperty("text", "quantityOnHand/value");

            // var status = new sap.m.Text().bindProperty("text", "status");

            oValueHelpDialog.getTable().addColumn(new sap.ui.table.Column({
                label: new sap.m.Label({
                    text: "Inventory"
                }),
                template: inventoryId,
                sortProperty: "inventoryId",
                filterProperty: "inventoryId"
            }));

            oValueHelpDialog.getTable().addColumn(new sap.ui.table.Column({
                label: new sap.m.Label({
                    text: "Quantity"
                }),
                template: qty,
                sortProperty: "quantityOnHand/value",
                filterProperty: "quantityOnHand/value"
            }));

            // oValueHelpDialog.getTable().addColumn(new sap.ui.table.Column({
            //     label: new sap.m.Label({
            //         text: i18nModel.getProperty("Status")
            //     }),
            //     template: status,
            //     sortProperty: "status",
            //     filterProperty: "status"
            // }));
            var oRowsModel = new sap.ui.model.json.JSONModel();
            oRowsModel.setData(InventoryList);
            oValueHelpDialog.getTable().setModel(oRowsModel);
            oValueHelpDialog.getTable().bindRows("/");
            oValueHelpDialog.open();


        },

        isSubscribingToNotifications: function () {

            var bNotificationsEnabled = true;

            return bNotificationsEnabled;
        },


        getCustomNotificationEvents: function (sTopic) {
            //return ["template"];
        },


        getNotificationMessageHandler: function (sTopic) {

            //if (sTopic === "template") {
            //    return this._handleNotificationMessage;
            //}
            return null;
        },

        _handleNotificationMessage: function (oMsg) {

            var sMessage = "Message not found in payload 'message' property";
            if (oMsg && oMsg.parameters && oMsg.parameters.length > 0) {
                for (var i = 0; i < oMsg.parameters.length; i++) {

                    switch (oMsg.parameters[i].name) {
                        case "template":

                            break;
                        case "template2":


                    }



                }
            }

        },


        onExit: function () {
            PluginViewController.prototype.onExit.apply(this, arguments);


        }
    });
});