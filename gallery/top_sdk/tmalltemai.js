//// JavaScript Document

//tmall.temai.subcats.search


var Tmall={};

var trackiid=[];
var curCid=50100982;
var curSubCid=50101052;
var start=0;


var total_results=0;
var total_page=0;
var page_size=48;
var page=1;




Tmall.getCats=function(){
	//tmall.temai.subcats.search 
	TOP.api('rest', 'get',{
			 method:'tmall.temai.subcats.search ',		
			 cat:50100982
			},function (resp){
				//alert("OK");

				if(resp.error_response){
					alert('系统错误!'+resp.error_response.msg);
					return false;
				}
				
				var tempO="";
				//alert(resp.item_cats);
				var tempCats=resp.tmall_temai_subcats_search_response.cat_list.tmall_tm_cat;
				
				for(var i=0;i<tempCats.length;i++){
					if(tempCats[i].sub_cat_id=='50101034') tempO+="<option value='"+tempCats[i].sub_cat_id+"' selected>"+tempCats[i].sub_cat_name+"</option>";
					else tempO+="<option value='"+tempCats[i].sub_cat_id+"'>"+tempCats[i].sub_cat_name+"</option>";
					}
				
				$('#tmallCids').html(tempO);
				
				Tmall.getSubcats(50101034);
				})
	
	}

Tmall.getSubcats=function(pcid){
	//tmall.temai.subcats.search 
	
	TOP.api('rest', 'get',{
			 method:'tmall.temai.subcats.search ',		
			 cat:pcid
			},function (resp){
				//alert("OK");
				
				if(resp.error_response){
					alert('系统错误!'+resp.error_response.msg);
					return false;
				}
				
				var tempO="";
				//alert(resp.item_cats);
				var tempCats=resp.tmall_temai_subcats_search_response.cat_list.tmall_tm_cat;
				
				for(var i=0;i<tempCats.length;i++){
					if(tempCats[i].sub_cat_id=='50101052') tempO+="<option value='"+tempCats[i].sub_cat_id+"' selected>"+tempCats[i].sub_cat_name+"</option>";
					else tempO+="<option value='"+tempCats[i].sub_cat_id+"'>"+tempCats[i].sub_cat_name+"</option>";
					}
				
				$('#tmallSubCids').html(tempO);
				
				
				Tmall.getteimai();
				})
	
	}


Tmall.getteimai=function(){
	$("#tmallbox").empty();
	trackiid=[];
	TOP.api('rest', 'get',{
			 method:'tmall.temai.items.search',		
			 cat:curSubCid,
			 start:start,
			 sort:"s"
			},function (resp){
				if(resp.error_response){
					alert('系统错误!'+resp.error_response.msg);
					return false;
				}
				
				var temphtml=$("<ul class='tmall-items'></ul>");
				$("#tmallbox").append(temphtml);
				var respItem=resp.tmall_temai_items_search_response.item_list.tmall_search_tm_item;
			
				total_results=resp.tmall_temai_items_search_response.total_results;
				total_page=resp.tmall_temai_items_search_response.total_page;
				page_size=resp.tmall_temai_items_search_response.page_size;
				page=resp.tmall_temai_items_search_response.page;
				//"total_results":649,
//"total_page":14,
//"page_size":48,
//"page":1,
//alert(page);
	$("#numiidBox").html("[本页共"+page_size+"个宝贝]");
	$('#curPage').html("当前第"+Number(page)+"/"+Number(total_page)+"页");

if(respItem.length>0){
	
			
		for(var i=0;i<respItem.length;i++){
				var tempURl=respItem[i].pic_url.split("_b.jpg")[0]+"_200x200.jpg";
				tempLi=$("<li  id='li"+respItem[i].track_iid +"'><a  id='a"+respItem[i].track_iid +"' href='"+respItem[i].detail_url+"' target='_blank' ><img src='"+tempURl+"' /><div><strong class='tmall-price m-price'>"+respItem[i].price+"</strong><strong class='tmall-price p-price'>"+respItem[i].promotion_price+"</strong><strong class='taokerate' id='r"+respItem[i].track_iid +"'></strong><span>"+respItem[i].title+"</span></div></a></li>");
					//tempLi=$("<li  id='li"+respItem[i].num_iid +"'><img src='"+tempURl+"' /></li>");
				temphtml.append(tempLi);
				trackiid.push(respItem[i].track_iid);
				}
				//alert(resp.tmall_temai_items_search_response.item_list.tmall_search_tm_item.length);
				
			Tmall.gettaoke(trackiid);
		}
	

			
}
			
)};

Tmall.gettaoke=function(track_iids){
	var username;
	//alert(track_iids);
	if(TOP.auth. getUser()!=null){
		var usernameObj=TOP.auth. getUser();
		username=usernameObj.nick;
		}else{
			username="img_test";
			}
		 TOP.api('rest', 'get',{
			 method:'taobao.taobaoke.widget.items.convert',
			 nick:username,
			track_iids:track_iids,
			 fields:'track_iid,click_url,commission_rate'
			 },function(resp){
				if(resp.error_response){
				alert('taobao.taobaoke.widget.items.convert接口获取商信息品失败!'+resp.error_response.msg);
				return false;
				}
				
				var respItem=resp.taobaoke_items.taobaoke_item;
				
				
				for(var i=0;i<respItem.length;i++){
					
					$("#r"+respItem[i].num_iid+"_track_11139").html("佣金："+Number(respItem[i].commission_rate)/100+"%");
					$("#a"+respItem[i].num_iid+"_track_11139").attr("href",respItem[i].click_url);
					}
				 })
	
	
	}

$('#tmallCids').change(
						 function(){
										   curSubCid=this.value;
										   page=1;
	start=0;
										   Tmall.getSubcats(curSubCid);
										   
										   });
										   
										   
										   									 
$('#tmallSubCids').change(
						 function(){
										   curSubCid=this.value;
										   page=1;
	start=0;
										   Tmall.getteimai();
										   



});




$('#perPage').click(function(){
						if(page>=1){
							//getItemImg(curPage-1);
							//page=curPage-1;
							start=start-48;
							
							
							Tmall.getteimai();
						
						}
						else{
							//alert( "已经是第一页");
							}
					 });

$('#nextPage').click(function(){
							 // alert("curPage="+curPage);
						if(page<total_page){
							start=start+48;
							Tmall.getteimai();
							
						}	  
					 })
					 
					 
					 

$(function(){
		//Tmall.getteimai(); 
		
		
$("img").lazyload({

     placeholder : "assets／loadgif.gif",
     effect      : "fadeIn"

});
		 
		Tmall.getCats(); 
		 //Tmall.getteimai();  
		
		   
		   })
