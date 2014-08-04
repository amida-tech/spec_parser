var fs = require("fs");
var libxmljs = require("libxmljs");
var XmlDOM = require('xmldom').DOMParser;
var _ = require("underscore");
var bbm = require("blue-button-meta");

// load the xml spec file
var xmlSpec = fs.readFileSync("document1.xml");
xmlSpec = new XmlDOM().parseFromString(xmlSpec.toString());

var sections = bbm.CCDA.sections;
var entries = bbm.CCDA.statements;
var section_OIDs = Object.keys(sections).map(function (key) {
    return sections[key];
});
var entry_OIDs = Object.keys(entries).map(function (key) {
    return entries[key];
});

var sections_entries = _.extend(sections, entries);

var code = {
	"codes": {}
};

var count = 0;
var section = null;
var containsCode = null;
var text = "";

traverseSpecXml(xmlSpec.documentElement);

function searchObj(obj, val) {
  for (var key in obj) {
    if (obj[key] === val) {
    	return key;
    }
  }
}


function traverseSpecXml(root) {

	if (root && typeof root === "object" && root.childNodes) {
		for (var i = 0; i < root.childNodes.length; i++) {	
			if (root.childNodes[i].data) {
				
				if (root.childNodes[i].data === "@code") {
					containsCode = true;
				}
				
				// set the section property
  	  	if (root.childNodes[i].data.indexOf(": templateId") > -1) {
  	  		var templateId = root.childNodes[i].data.split("templateId")[1].split("(")[0].trim();
  	  		section = searchObj(sections_entries, templateId);
  	  		code["codes"][section] = "";
  	  	}

  	  	if (section && containsCode) {
  	  		console.log(section);
  	  		text += root.childNodes[i].data;

  	  		console.log(text);
  	  	}
  	  
  	  }	
  	  traverseSpecXml(root.childNodes[i]);  	
  	}
  }

  
  if (root.attributes && root.attributes.length > 2) {
  		if (section && text.indexOf("=") > -1 && !code["codes"][section]["code"]) {
  			console.log(text);

  			code["codes"][section] = {
  				"code": text.split("=")[1].split(" ")[0].replace("\"", "").replace("\"", ""),
  				"code_system": text.split("(")[1].split(")")[0].split(" ")[2] ? text.split("(")[1].split(")")[0].split(" ")[2] : "",
  				"code_system_name": text.split("(")[1].split(")")[0].split(" ")[1] ? text.split("(")[1].split(")")[0].split(" ")[1] : "",
  				"name": text.split('\"')[2].split("(")[0].trim()

  			}
  		}
  	containsCode = false;
  	text = "";
	}

}

fs.writeFileSync("codes_out.json", JSON.stringify(code, null, 4));
