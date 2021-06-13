
//1st register plugin
/*
W.plugins.pickerTools = W.TagPlugin.instance({
        ident: 'pickerTools',
        hasURL: false,
        className: "pickerTools"
});


W.define(
    '@plugins/pickerTools',
    ['map', 'picker', '$', 'rootScope', 'broadcast'],
    (function (map, picker, $, rs, bcast) {
*/


//for internal module,  move css to the 4th arg
var css=
`
.picker-div-text {
    white-space: nowrap;
    padding: 4px;
    font-size: 10px;
    line-height: 1.1;
    color: red;
}
#picker-div-left {
    right: 2px;
    white-space: nowrap;
    padding: 4px;
    font-size: 10px;
    line-height: 1.1;
}
#picker-div-left span {
    padding: 0px;
}
.picker-div-desk #picker-div-left {
    background-color: transparent;
    border-radius: 8px 0px 0px 8px;
    margin-right: 1px;
}
.picker-div-mobl #picker-div-left {
    right: 5px;
    border-radius: 4px;
    background-color: transparent;
}
#picker-div-right {
    white-space: nowrap;
    padding: 4px;
    font-size: 10px;
    line-height: 1.1;
}
.p-empty.picker-div-desk #picker-div-right {
    background-color:rgba(68,65,65,0.84);
    position:relative;
    top:-16px;
    border-top-right-radius: 20px;
    border-bottom-right-radius: 20px;
}
.p-empty.picker-div-desk {
    width:auto !important;
}
.p-empty.picker-div-desk .picker-close-button {
    left: calc(100%) !important;
}
.p-empty.picker-div-desk .picker-share{
    display:none !important;
}
#picker-div-right span {
    padding: 0px;
}
.picker-div-desk #picker-div-right {
    padding-right: 20px;
}
.picker-div-mobl #picker-div-right{
    position: absolute;
    left: 5px;
    border-radius: 4px;
    background-color: rgba(68,65,65,0.84);
}
.picker-anchor-mobl {
    position: absolute;
    margin-top: -67px;
    width: 0px;
    left: 1px;
}
`
document.head.insertAdjacentHTML('beforeend', `<style>${css}</style>`);


        //for mjs module
        import map from '@windy/map'
        import picker from '@windy/picker'
        import $ from '@windy/$'
        import rs from '@windy/rootScope'
        import bcast from  '@windy/broadcast'


        let pluginVersion='0.1.1';

        //picker div left
        let pdl=document.createElement("div");
        pdl.id="picker-div-left";
        pdl.style.position="absolute";
        //pdl.classList.add(rs.isMobile?"picker-div-mobl":"picker-div-desk");

        //picker div right
        let pdr=document.createElement("div");
        pdr.id="picker-div-right";
        //pdr.classList.add(rs.isMobile?"picker-div-mobl":"picker-div-desk");

        let pckEl;
        let pt={pckr:{_icon:null}};

        ////send text to mobile picker div.
        function mobileDiv(d){
            if (rs.isMobile && $("#plugin-picker")){
                pckEl=$("#plugin-picker");//W.pickerMobile.popup;
                pckEl.classList.add("picker-div-mobl");
                if (!pckEl.contains(d)){
                    pckEl.style.position="fixed";
                    let pda=document.createElement("div");
                    pda.classList.add("picker-anchor-mobl");
                    pckEl.appendChild(pda);
                    pda.appendChild(d);
                }
            }
        }

        function addContent(html,el){
            if (html){
                el.style.display="table";
                if (html.nodeName=="DIV"){
                    if (html.innerHTML){
                        for(;el.firstChild;)el.firstChild.remove();
                        el.appendChild(html);
                    }  else el.style.display="none";
                } else el.innerHTML=html;
            } else {
                el.style.display="none";
            }
        }

        pt.fillRightDiv=function(html){
            if(!rs.isMobile){
                if ($(".picker-content")){
                    pckEl=$(".picker-content");//W.pickerDesktop.popupContent;
                    pckEl.classList.add("picker-div-desk");
                    if (!pckEl.contains(pdr)){
                        pckEl.parentNode.style.outlineStyle="none";  //on my tablet long touching picker causes a persistent orange outline.  this stops it.
                        pckEl.appendChild(pdr);
                    }
                }
            } else  mobileDiv(pdr);
            addContent(html,pdr);
        }

        pt.fillLeftDiv=function(html,pickerBckgCol=false){
            ////pickerBckgCol=false is transparent,  true= "rgba(68,65,65,0.84)"
            if (pickerBckgCol)  pdl.style.backgroundColor="rgba(68,65,65,0.84)";
            else pdl.style.backgroundColor="transparent";
            if(!rs.isMobile){
                if ($(".picker-content")){//W.pickerDesktop && W.pickerDesktop.popupContent){
                    pckEl=$(".picker-content");//W.pickerDesktop.popupContent;
                    pckEl.classList.add("picker-div-desk");
                    if (!pckEl.contains(pdl)){
                        pckEl.parentNode.style.outlineStyle="none";
                        let pda=document.createElement("div");
                        pckEl.appendChild(pda);
                        Object.assign(pda.style,{top:"0px",width:"0px",position:"absolute"});
                        pda.appendChild(pdl);
                    }
                }
            } else mobileDiv(pdl);
            addContent(html,pdl);
        }

        pt.hideLeftDiv=function() { pdl.style.display="none"; }
        pt.hideRightDiv=function(){ pdr.style.display="none"; }
        pt.showLeftDiv=function() { pdl.style.display="table"; }
        pt.showRightDiv=function(){ pdr.style.display="table"; }

        pt.removeElements=function() {
            if (pdr.parentNode)pdr.parentNode.removeChild(pdr);
            if (pdl.parentNode)pdl.parentNode.removeChild(pdl);
        }

        pt.isOpen=function(){
            if (!rs.isMobile && $('.picker-content')) return "desktop";
            else if (rs.isMobile && $("#plugin-picker")) return "mobile";
            else return null;
        }

        let dragFxs=[];

        function setDrag(source, e) { //source = marker or map

            let getLL = ll => {
                if (source=="marker"){
                    ll=e.target._latlng;
                    ll.lon=ll.lng;
                } else {
                    ll = map.containerPointToLatLng([0,180]);
                    ll.lon = ll.lng = map.getCenter().lng;
                }
                return ll;
            }

            dragFxs.forEach(f=>{
                if (f.ready){
                    f.cbf(getLL());
                    f.ready=false;
                    clearTimeout(f.sendIfNotMoved);
                    setTimeout(()=>{
                        f.ready=true;
                        f.sendIfNotMoved = setTimeout(()=>{
                            f.cbf(getLL());
                        },f.interv)
                    },f.interv);
                }
            })
        }


        function wait4pckr(tries=0){

                if (!rs.isMobile){
                    if (!pt.pckr._icon){
                        map.eachLayer(l=>{
                            //console.log(tries, l);
                            if(l.options&&l.options.icon&&l.options.icon.options.className=="picker open"){
                                pt.pckr=l;
                                //pt.pckr.on("drag",e=>move(e,"marker"));
                                pt.pckr.on("drag",  setDrag.bind(null,"marker"));
                                //console.log("found");


                                //pt.pckr._icon.style["-webkit-animation"]="none";
                                //pt.pckr._icon.style["-webkit-transition"]="none";
                                //pt.pckr._icon.style["animation"]="none";

                                //pt.pckr.on("dragstart",()=>{if($("#plugin-rplanner"))$("#plugin-rplanner").style.opacity=0});
                                //pt.pckr.on("dragend",()=>{if($("#plugin-rplanner"))$("#plugin-rplanner").style.opacity=1});

                                //console.log("PICKER",pt.pckr);
                            }
                        });
                        if (!pt.pckr._icon) {
                            if(tries<4)setTimeout(wait4pckr,500, tries+1);
                        }
                    }
                } else {
                    map.on("move", setDrag.bind(null,"map"))
                }

                /*
                let open=pt.isOpen();
                if (open=="desktop"){
                    pt.pckr=W.pickerDesktop.marker;
                    pt.pckr.on("drag",pckrMovef);
                    pt.pckr.on("dragstart",()=>{if($("#plugin-rplanner"))$("#plugin-rplanner").style.opacity=0});
                    pt.pckr.on("dragend",()=>{if($("#plugin-rplanner"))$("#plugin-rplanner").style.opacity=1});
                } else if (open=="mobile") { //W.pickerMobile.popup no longer exists of picker closed
                    map.on("move",mapMovef)
                }
                */
        }

        function remListeners(){
            if(rs.isMobile) map.off("move",setDrag);
            else if (pt.pckr.off) pt.pckr.off("drag",setDrag);
        }


        //--picker drag listener
        pt.drag = function(cbf, interv=100, pluginIdent){          //by default the picker is cbf is requested every 100ms when dragged.

            dragFxs.push({cbf, interv, ready:true, sendIfNotMoved:null});  //sendIfNotMoved : send coords if map or picker has not moved after the interval.

            wait4pckr(0); //in case picker has already been opened;

            //bcast.on("pluginOpened",e=>{
            //    setTimeout(wait4pckr,500);
            //});

            //seems to be only added if not yet added:
            picker.on("pickerOpened", wait4pckr);
            picker.on("pickerClosed", remListeners);
        }

        pt.dragOff = function(cbf){
            let ix = dragFxs.findIndex(e=>e.cbf===cbf);
            if (ix!=-1) dragFxs.splice(ix,1);
            if (dragFxs.length==0){
                picker.off("pickerOpened", wait4pckr);
                picker.off("pickerClosed", remListeners);
                remListeners();
            }
        }

        //for mjs module
        export default pt;



/*
        return pt;
    })
    , false //no html
    ,       //css string goes here

)


//set isLoaded to true, so loading is not attempted from location when calling open().  open() will insert the CSS and HTML
W.plugins.pickerTools.isLoaded=true;
W.plugins.pickerTools.open();
*/