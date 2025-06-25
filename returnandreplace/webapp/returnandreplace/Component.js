sap.ui.define([
	"sap/dm/dme/podfoundation/component/production/ProductionUIComponent",
	"sap/ui/Device"
], function (ProductionUIComponent, Device) {
	"use strict";

	return ProductionUIComponent.extend("rits.custom.plugins.returnandreplace.returnandreplace.Component", {
		metadata: {
			manifest: "json"
		}
	});
});