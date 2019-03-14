var config = {
    			apiKey: "AIzaSyBvJ1UAm4EvsT9-iGNV7fCISDbA38K0INQ",
    			authDomain: "nodeweaver-3db7c.firebaseapp.com",
    			databaseURL: "https://nodeweaver-3db7c.firebaseio.com",
    			projectId: "nodeweaver-3db7c",
    			storageBucket: "nodeweaver-3db7c.appspot.com",
    			messagingSenderId: "201179043760"
  			};

firebase.initializeApp(config);

var provider = new firebase.auth.GoogleAuthProvider();
var ui = new firebaseui.auth.AuthUI(firebase.auth());

var uiConfig = {
				callbacks: {
					signInSuccessWithAuthResult: function(authResult, redirectUrl) {
						signedIn();
						return false;
					},
					uiShown: function() {
						document.getElementById('loader').style.display = 'none';
					}
				},
				signInFlow: 'popup',
				signInSuccessUrl: '/',
				signInOptions: [firebase.auth.GoogleAuthProvider.PROVIDER_ID, firebase.auth.EmailAuthProvider.PROVIDER_ID]
				//tosUrl: '<your-tos-url>',// Terms of service url.
				//privacyPolicyUrl: '<your-privacy-policy-url>'// Privacy policy url.
			};

			var user = firebase.auth().currentUser;
			if (user) {
				signedIn();
			} else {
				ui.start('#firebaseui-auth-container', uiConfig);// The start method will wait until the DOM is loaded.
			}

function signedIn(){
	
				user = firebase.auth().currentUser;
				var database = firebase.database();
				firebase.database().ref('/users/' + user.uid).once('value').then(function(snapshot) {
  					////console.log("SNAPSHOT:", snapshot.val().mapDataText);
  					document.getElementById("rootnode").outerHTML = snapshot.val().mapDataText;
  					init();
				});
				////console.log("signedIn", user);
				var textContent;
				if(user.displayName){textContent = user.displayName;} else {textContent = user.email;}
				var newText = document.createElement("DIV");////console.log("2");
				newText.setAttribute("class", "nodetitle");////console.log("3");
				var t = document.createTextNode("Logged in as: " + textContent);////console.log("4");       // Create a text node
				newText.appendChild(t);////console.log("5");
				var nodeReplace = document.getElementById("logintext");
				nodeReplace.parentNode.replaceChild (newText, nodeReplace);
				if(user.photoURL){
					var newImage = document.createElement("IMG");
					newImage.src = user.photoURL;
					newText.appendChild(newImage);
					newImage.style.width = "50px";
					newImage.style.height = "50px";
				}
			}
			// attach the document listeners
			var dragging = false;
			var dragged = null;
			var detached = false;
			var pos1, pos2, pos3, pos4;

			var joinCurveHeight = 150;
			var joinTextOffset = 20;//-30;
			var joinColour = "#555555";

			var draw = SVG('drawing').size('100%', '100%');
			var drawover = SVG('drawingover').size('100%', '100%');

			var nodesArray = [];
			//var nodesWithoutIndexesArray = [];
			var joinsArray = [];
			var nodeJoinsArray = [];
			var lines = [];
			var linesover = [];
			var textsover = [];

			var joinsObject = {};

			//var highestUnusedID = 0;

			function scanNodes(){
				var nodesObject = document.getElementsByClassName("node");
				//var nodesWithoutIndexes = 0;
				for (var i = nodesObject.length - 1; i >= 0; i--) {
					// if node already has an id, assign it that index in the array
					if(nodesObject[i].id){
						var nodeIndex = parseInt(nodesObject[i].id);
						nodesArray[nodeIndex] = nodesObject[i];
						nodeJoinsArray[nodeIndex] = [];
					} else {
						var nodeIndex = i;
						nodesArray[nodeIndex] = nodesObject[i];
						nodesArray[nodeIndex].id = i;
						nodesArray[nodeIndex].setAttribute("id", i);
						nodeJoinsArray[nodeIndex] = [];
						// if it doesnt, store it in a new array for numbering later
						//nodesWithoutIndexesArray[nodesWithoutIndexes] = nodesObject[i];
						//nodesWithoutIndexes +=1;
					}
				}
				////console.log("nodes without IDs:", nodesWithoutIndexes);
			}

			function scanJoins(){
				var joinScanObject = document.getElementsByClassName("join");
				////console.log("JOINSOBJECT: ", joinScanObject.length);
				for (var i = joinScanObject.length - 1; i >= 0; i--) {
					joinsArray[i] = joinScanObject[i];
				}
			}

			function addLines(){
				for (var i = nodesArray.length - 1; i >= 0; i--) {
						addLine(i);
				}
			}

			function addJoins(){
				for (var i = joinsArray.length - 1; i >= 0; i--) {
						updateJoin(i);
				}
			}


			function updateJoin(num){

				var nodePair = joinsArray[num].id.split("_");
				////console.log(joinsArray[num].id, nodePair);
				var nodeA = parseInt(nodePair[0]);
				var nodeB = parseInt(nodePair[1]);
				var lineWidth = Number(nodePair[2]);
				
				var box1 = nodesArray[nodeA].getBoundingClientRect();
				var box2 = nodesArray[nodeB].getBoundingClientRect();
				var x1 = box1.left + (box1.width/2);
				var y1 = box1.top + (box1.height/2);
				var x2 = box2.left + (box2.width/2);
				var y2 = box2.top + (box2.height/2);
				var x3 = (x1+x2)/2;
				var y3 = ((y1+y2)/2) - joinCurveHeight;

				joinsArray[num].style.left = x3 + "px";
				joinsArray[num].style.top = y3 + "px";


				if(x2<x1){
					var oldx2 = x2; x2 = x1; x1 = oldx2;
					var oldy2 = y2; y2 = y1; y1 = oldy2;
				}

				var m = "M"; var s = " "; var c = " C "; var jt = joinTextOffset; var jc = joinCurveHeight;
				var pathText =  m + (x1-jt) + s + y1 + c + (x1-jt) + s + (y1-jc-jt) + s + (x2+jt) + s + (y2-jc-jt) + s + (x2+jt) + s + y2;
				var path = m + (x1+jt) + s + y1 + c + (x1+jt) + s + (y1-jc+jt) + s + (x2-jt) + s + (y2-jc+jt) + s + (x2-jt) + s + y2;

				if(linesover[num]){
					//console.log("A: ", textsover[num].length());
					linesover[num].plot(path);
					//console.log("B: ", textsover[num].length());
					textsover[num].plot(pathText);
					//console.log("C: ", textsover[num].length());
				} else{
					nodeJoinsArray[nodeA].push(num);
					nodeJoinsArray[nodeB].push(num);
					joinsArray[num].childNodes[0].style.visibility = "hidden";

					////console.log("G: ", textsover[num].length());
					textsover[num] = drawover.text(joinsArray[num].childNodes[0].textContent);
					//console.log("H: ", textsover[num].length());
					
					linesover[num] = drawover.path(path).fill('none').stroke({ width: lineWidth , color:joinColour, dasharray:[2,10]});
					//console.log("I: ", textsover[num].length());
					textsover[num].path(pathText).font({ size: 12, family: 'Source Code Pro' });
					//console.log("J: ", textsover[num].length());
				}

			//console.log("D: ", textsover[num].length());
				var offset = ( textsover[num].track().length()/2 - ( textsover[num].length()/2));// - (textsover[num].length()/2);   // *.68 is to fix a rendering bug, careful with this.
				//console.log("E: ", textsover[num].length());
				textsover[num].textPath().attr('startOffset', offset);
				//console.log("F: ", textsover[num].length());

			}

			function addLine(num){
				var box1 = nodesArray[num].getBoundingClientRect();
				var box2 = nodesArray[num].parentNode.getBoundingClientRect();
				var x1 = box1.left + (box1.width/2);
				var y1 = box1.top + (box1.height/2);
				var x2 = box2.left + (box2.width/2);
				var y2 = box2.top + (box2.height/2);
				if(lines[num]){
					lines[num].plot([['M',x1,y1], ['C',x2,y1,(x1+x2)/2,(y1+y2)/2,x2,y2]]);
				} else{
					lines[num] = draw.path([['M',x1,y1], ['C',x2,y1,(x1+x2)/2,(y1+y2)/2,x2,y2]]).fill('none').stroke({ width: 2 , color:"#cccccc"});
				}
				
				if(!nodesArray[num].parentNode.classList.contains("node")){
						lines[num].hide();
				}
			}

			function updateJoins(nodeNum){
				//if(isNan(nodeNum)){
					if(nodeJoinsArray[nodeNum].length>0){
						for (var i = nodeJoinsArray[nodeNum].length - 1; i >= 0; i--) {
							updateJoin(nodeJoinsArray[nodeNum][i]);
						}
					}
				//}
			}

			function updateLine(node){
				if(node.parentNode.classList.contains("node")){
					var box1 = node.getBoundingClientRect();
					var box2 = node.parentNode.getBoundingClientRect();
					var x1 = box1.left + (box1.width/2);
					var y1 = box1.top + (box1.height/2);
					var x2 = box2.left + (box2.width/2);
					var y2 = box2.top + (box2.height/2);
					var line = lines[parseInt(node.id)];
					//line.plot(x1, y1, x2, y2);
					line.plot([['M',x1,y1], ['C',x2,y1,(x1+x2)/2,(y1+y2)/2,x2,y2]]);

					//line.plot([['M', x1, y1],['L', x2, y2]]);
				}

				

				if(node.childNodes.length>0){
					for (var i = node.childNodes.length - 1; i >= 0; i--) {
						if(node.childNodes[i].classList){
							if(node.childNodes[i].classList.contains("node")){
								updateLine(node.childNodes[i]);
							}
						}
					}
				}
				if(node.id!="rootnode"){
					updateJoins(parseInt(node.id));
				}

			}

			function init(){
				scanNodes();
				addLines();
				scanJoins();
				addJoins();
			}

			init();
			//update();

			function update(){
				//requestAnimationFrame(update);
				//updateJoins(1);
			}

			function checkDistance(){
				for (var i=0; i<joinsArray.length; i++){
					var nodePair = joinsArray[i].id.split("_");
					var nodeA = parseInt(nodePair[0]);
					var nodeB = parseInt(nodePair[1]);
					var strength = parseInt(nodePair[2]);
					var box1 = nodesArray[nodeA].getBoundingClientRect();
					var box2 = nodesArray[nodeB].getBoundingClientRect();
					var x1 = box1.left;// + (box1.width/2);
					var y1 = box1.top;// + (box1.height/2);
					var x2 = box2.left;// + (box2.width/2);
					var y2 = box2.top;// + (box2.height/2);
        			// get distance between nodes
        			var dx = x2 - x1;
        			var dy = y2 - y1;
        			var dist = Math.sqrt(dx * dx + dy * dy);
        			// calculate maximum distance
        			var maxDist = 300 + (400/strength);
					// if distance greater than max, move together
					if (dist > maxDist) {
            			var angle = Math.atan2(dy, dx);
            			cosa = Math.cos(angle);
            			sina = Math.sin(angle);
            			var diff = (dist-maxDist) / 2;
            			var cosd = cosa * diff;
            			var sind = sina * diff;

            			var newx1 = x1 + cosd;
            			var newy1 = y1 + sind;
            			var newx2 = x2 - cosd;
            			var newy2 = y2 - sind;

            			////console.log(newx1, newy1, newx2, newy2, x1, y1, x2, y2, sind, cosd);

            			if(nodesArray[nodeA]==dragged){
            				nodesArray[nodeB].style.left = newx2 + "px";
            				nodesArray[nodeB].style.top = newy2 + "px";
            			} else if (nodesArray[nodeB]==dragged){
            				nodesArray[nodeA].style.left = newx1 + "px";
            				nodesArray[nodeA].style.top = newy1 + "px";
            			} else {
            				nodesArray[nodeA].style.left = newx1 + "px";
            				nodesArray[nodeA].style.top = newy1 + "px";
            				nodesArray[nodeB].style.left = newx2 + "px";
            				nodesArray[nodeB].style.top = newy2 + "px";
            			}
            			
            		}
            		
            	}
			}

			function checkProximity(){
				for (var j=1; j<nodesArray.length; j++){
            		for (var k=j-1; k>=0; k--){
            			var box1 = nodesArray[j].getBoundingClientRect();
						var box2 = nodesArray[k].getBoundingClientRect();
						
						var y1 = box1.top;// + (box1.height/2);
						var y2 = box2.top;// + (box2.height/2);
						////console.log("Y1 = ", y1);
						////console.log("Y2 = ", y2);
        				var dy = y2 - y1;
        				////console.log("DY = ", dy);
        				var minydist = (box2.height/2) + (box1.height/2);// + 20;
        				
        				if (Math.abs(dy)<minydist){
        					var x1 = box1.left;// + (box1.width/2);
        					var x2 = box2.left;// + (box2.width/2);
        					////console.log("X1 = ", x1);
							////console.log("X2 = ", x2);

        					var dx = x2 - x1;
        					////console.log("DX = ", dx);
        					var minxdist = (box2.width/2) + (box1.width/2) + 20;
        					////console.log("minxdist = ", minxdist);
        					if (Math.abs(dx)<minxdist){
        						
        						diffy = (minydist - dy)/2;
								////console.log("diffy = ", diffy);
            					//var newx1 = x1 -(dx/2);
            					var newy1 = y1+diffy;
            					////console.log("newy1 = ", newy1);
            					//var newx2 = x2 +(dx/2);
            					var newy2 = y2-diffy;//(y2 +(diffy/2))-1;
            					////console.log("newy2 = ", newy2);
            					//console.log(minydist, dy, diffy*2);
            					////console.log(newx1, newy1, newx2, newy2, x1, y1, x2, y2, sind, cosd);

            					if(nodesArray[j]==dragged){
            						//nodesArray[k].style.left = newx2 + "px";
            						nodesArray[k].style.top = newy2 + "px";
            					} else if (nodesArray[k]==dragged){
            						//nodesArray[j].style.left = newx1 + "px";
            						nodesArray[j].style.top = newy1 + "px";
            					} else {
            						//nodesArray[j].style.left = newx1 + "px";
            						oldya = nodesArray[j].style.top;
            						nodesArray[j].style.top = newy1 + "px";
            						//nodesArray[k].style.left = newx2 + "px";
            						oldyb = nodesArray[k].style.top;
            						nodesArray[k].style.top = newy2 + "px";
            						////console.log(oldya, nodesArray[j].style.top, oldyb, nodesArray[k].style.top)
            					}
        					}
        				}
        				
            		}
            	}

			}


			function addNewJoin(newTitle, newIndex){
				var newNode = createNewJoin(newTitle, newIndex);
				document.getElementById("rootnodeover").appendChild(newNode);
				joinsArray.push(newNode);

				addLine(nodesArray.length-1);

			}

			function createNewJoin(newTitle, newIndex){
				var newText = document.createElement("DIV");
				var newNode = document.createElement("DIV");
				newText.setAttribute("class", "nodetitle");
				newNode.className = "node join";
				newNode.setAttribute("id", newIndex);
				var t = document.createTextNode(newTitle);
				newText.appendChild(t);
				newNode.appendChild(newText);
				return newNode;
			}


			

			document.addEventListener('mousedown', onDocumentMouseDown, false);
			document.addEventListener('mousemove', onDocumentMouseMove, false);
			document.addEventListener('mouseup', onDocumentMouseUp, false);

			document.addEventListener('dblclick', onDocumentDoubleClick, false);

			document.addEventListener('touchstart', onDocumentTouchStart, false);
			document.addEventListener('touchmove', onDocumentTouchMove, false);
			document.addEventListener('touchend', onDocumentTouchEnd, false);

			document.addEventListener('keydown', onDocumentKeyDown, false);

			document.addEventListener('blur', onDocumentBlur, true);

			document.addEventListener('contextmenu', onContextMenu, false);

			document.addEventListener('mouseover', onMouseOver, false);



			window.addEventListener('resize', onDocumentResize, false);

			function onContextMenu(event){
				event.preventDefault();
			}


			function onMouseOver(event){
				////console.log("mouseOver", event.target);
			}

			function attachNodeToParent(child, parent){
				////console.log("attachNodeToParent");
				//var box1 = parent.getBoundingClientRect();
					////console.log("old:", box1.left, box1.top);
				parent.appendChild(child);
				//var box2 = node.getBoundingClientRect();
					////console.log("new:", box2.left, box2.top);
				lines[Number(child.id)].show();
				child.style.left = 0;//(((box1.left)/window.innerWidth)*100) + "%";
				child.style.top = 50 + "px";//(((box1.top)/window.innerHeight)*100) + "%";
				updateLine(child);
			}


			function onDocumentKeyDown(event){
				////console.log("keydown", event.key, event.target);
				if (event.target.classList.contains("nodetitleinput")){
					if(event.key == "Enter"){
    					//finishEditNode(event.target);
    					event.target.blur();
    				}
    				
				} else {
					if(event.key == "s"){
    					
    					if(event.getModifierState("Control")){
    						event.preventDefault();
							////console.log("SAVE KEYS PRESSED");
							saveTextAsFile();
    					}
    					
    				}
				}
			}

			function saveTextAsFile(){
				if(user){
				var textToWrite = document.getElementById("rootnode").outerHTML;
				//var textFileAsBlob = new Blob([textToWrite], {type:'text/plain'});

				firebase.database().ref('users/' + user.uid).set({
    				mapDataText: textToWrite
  				});
			} else {
				var textToWrite = document.getElementById("rootnode").outerHTML;
				var textFileAsBlob = new Blob([textToWrite], {type:'text/plain'});

			
				
				var fileNameToSaveAs = "file.txt";

				var downloadLink = document.createElement("a");
				downloadLink.download = fileNameToSaveAs;
				downloadLink.innerHTML = "Download File";
				if (window.webkitURL !== null)
				{
		// Chrome allows the link to be clicked
		// without actually adding it to the DOM.
		downloadLink.href = window.webkitURL.createObjectURL(textFileAsBlob);
	}
	else
	{
		// Firefox requires the link to be added to the DOM
		// before it can be clicked.
		downloadLink.href = window.URL.createObjectURL(textFileAsBlob);
		downloadLink.onclick = destroyClickedElement;
		downloadLink.style.display = "none";
		document.body.appendChild(downloadLink);
	}

	downloadLink.click();
}
}

function destroyClickedElement(event)
{
	document.body.removeChild(event.target);
}


			function onDocumentBlur(event){
				////console.log("blur", event.target);
				if (event.target.classList.contains("nodetitleinput")){
    				finishEditNode(event.target);

				}
			}

			function onDocumentDoubleClick(event){
				////console.log("doubleclick");
				if (event.target.classList.contains("nodetitle")){
    				startEditNode(event.target);
				}
			}

			function finishEditNode(node){
				var textContent = node.value;////console.log("1");
				
				var newText = document.createElement("DIV");////console.log("2");
				newText.setAttribute("class", "nodetitle");////console.log("3");
				var t = document.createTextNode(textContent);////console.log("4");       // Create a text node
				newText.appendChild(t);////console.log("5");
				node.parentNode.replaceChild (newText, node);////console.log("6");
				updateLine(newText.parentNode);
			}

			function startEditNode(node){
				var textContent = node.textContent;
				////console.log(node);
				var inputText = document.createElement("INPUT");
				inputText.setAttribute("type", "text");
				inputText.setAttribute("class", "nodetitleinput");
				inputText.value = textContent;
				node.parentNode.replaceChild (inputText, node);
				inputText.focus();
			}

			function onDocumentResize(event){
				updateLine(document.getElementById("rootnode"));
			}

			function onDocumentTouchStart(event){
				//event = event || window.event; // needed for IE??
				//event.preventDefault();
				////console.log(event.target.className);
				if (event.target.classList.contains("node")){
					pos3 = event.touches[0].clientX;
    				pos4 = event.touches[0].clientY;
    				startNodeDrag(event.target, 0);
				} else if (event.target.parentNode.classList.contains("node")){
					//event.preventDefault();
					pos3 = event.target.parentNode.clientX;
    				pos4 = event.target.parentNode.clientY;
    				startNodeDrag(event.target.parentNode, 0);
				}
			}

			function onDocumentTouchMove(event){
				//event = event || window.event; // needed for IE??
				//event.preventDefault();
				if(dragging){
					pos1 = pos3 - event.touches[0].clientX;
    				pos2 = pos4 - event.touches[0].clientY;
    				pos3 = event.touches[0].clientX;
    				pos4 = event.touches[0].clientY;
    				nodeDrag(dragged.parentNode.id == "rootnode");
				}
			}

			function onDocumentTouchEnd(event){
				//event = event || window.event; // needed for IE??
				//event.preventDefault();
				if(dragging){
					stopNodeDrag();
				}
			}

			function onDocumentMouseDown(event){
				////console.log("mousedown", event.target);
				////console.log(event.target);
				//event = event || window.event; // needed for IE??
				if (!event.target.classList.contains("nodetitleinput")){
					if (event.target.classList.contains("node")){
						event.preventDefault();
						pos3 = event.clientX;
    					pos4 = event.clientY;
    					startNodeDrag(event.target, event.button);
    					
					} else if (event.target.parentNode.classList.contains("node")){
						event.preventDefault();
						pos3 = event.clientX;
    					pos4 = event.clientY;
    					startNodeDrag(event.target.parentNode, event.button);
					} else if (event.target.parentNode.id == "drawing"){
						if(event.button == 2){
							pos3 = event.clientX;
    					pos4 = event.clientY;
							addNewNode(event.clientX, event.clientY, "Blank", true);
						}
					}
				}
			}

			function addNewNode(x, y, newTitle, withDrag){
				var newNode = createNode(newTitle);
				document.getElementById("rootnode").appendChild(newNode);
				nodesArray.push(newNode);
				nodeJoinsArray.push([]);
				addLine(nodesArray.length-1);
				newNode.style.left = x-10 + "px";
				newNode.style.top = y-10 + "px";
				if(withDrag){startNodeDrag(newNode, 2);}
			}

			function createNode(newTitle){
				var newText = document.createElement("DIV");
				var newNode = document.createElement("DIV");
				newText.setAttribute("class", "nodetitle");
				newNode.setAttribute("class", "node");
				newNode.setAttribute("id", nodesArray.length);
				var t = document.createTextNode(newTitle);
				newText.appendChild(t);
				newNode.appendChild(newText);
				return newNode;
			}

			function onDocumentMouseMove(event){
				//event = event || window.event; // needed for IE??
				
				if(dragging){
					event.preventDefault();
					////console.log(event.target);
					pos1 = pos3 - event.clientX;
    				pos2 = pos4 - event.clientY;
    				pos3 = event.clientX;
    				pos4 = event.clientY;
    				nodeDrag(dragged.parentNode.id == "rootnode");
				}
			}

			function onDocumentMouseUp(event){
				////console.log("mouseup");
				//event = event || window.event; // needed for IE??
				
				if(dragging){
					event.preventDefault();
					if(detached){
					////console.log("drop-carrying");

					dragged.hidden = true;
					var elemBelow = document.elementFromPoint(event.clientX, event.clientY);
					dragged.hidden = false;

					if (elemBelow.classList.contains("node")){
    					attachNodeToParent(dragged, elemBelow);
					} else if (elemBelow.parentNode.classList.contains("node")){

    					attachNodeToParent(dragged, elemBelow.parentNode);
					}
				}
					
  					
  					

					stopNodeDrag();
				}
			}

			function startNodeDrag(node, button){
				
				dragging = true;
				dragged = node;
				if(dragged.parentNode.id == "rootnode"){
					detached = true;
				}
				if (button==2){
					detached = true;
					var box1 = node.getBoundingClientRect();
					////console.log("old:", box1.left, box1.top);
					document.getElementById("rootnode").appendChild(node);
					var box2 = node.getBoundingClientRect();
					////console.log("new:", box2.left, box2.top);
					lines[Number(node.id)].hide();
					node.style.left = (((box1.left)/window.innerWidth)*100) + "%";
					node.style.top = (((box1.top)/window.innerHeight)*100) + "%";
				}
				//node.style.cursor = "move";
			}

			function nodeDrag(proportional){
				
				////console.log(dragged.parentNode.id);
				////console.log("nodeDrag", pos1, pos2, pos3, pos4);
				if(proportional){
					////console.log("proportional")
					
    				////console.log(dragged.offsetLeft, pos1, dragged.offsetLeft - pos1, (((dragged.offsetLeft - pos1)/window.innerWidth)*100));

    				dragged.style.top = (dragged.offsetTop - pos2) + "px";
    				dragged.style.left = (dragged.offsetLeft - pos1) + "px";

    				////console.log(dragged.style.left);
				} else{
					dragged.style.top = (dragged.offsetTop - pos2) + "px";
    				dragged.style.left = (dragged.offsetLeft - pos1) + "px";
    			}
    			updateLine(dragged);
			}

			function stopNodeDrag(){
				////console.log("stopNodeDrag");
				if(dragged.parentNode.id == "rootnode"){
					dragged.style.top = (((dragged.offsetTop - pos2)/window.innerHeight)*100) + "%";
    				dragged.style.left = (((dragged.offsetLeft - pos1)/window.innerWidth)*100) + "%";
				}
				dragging = false;
				detached=false;
				dragged = null;
			}
