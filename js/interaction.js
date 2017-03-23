//公用函数


//addLoadEvent函数
function addLoadEvent(func){
	var oldonload = window.onload;
	if(typeof window.onload != "function"){
		window.onload = func;
	}
	else{
		window.onload = function(){
			oldonload();
			func();
		}
	}
}


//ajax 方法
function ajax(url,data,method,success,error){
	var req = new XMLHttpRequest(),
		data = data || {},
		method = method || "get",
		success = success || function(){},
		error = error || function(f){alert(url+"发生错误！")},
		resA = "";
	//在send前重置onreadystatechange方法，否则会出现新的同步请求会执行两次成功回调
	req.onreadystatechange = function(){
		if(req.readyState == 4){
			if(req.status >= 200 && req.status < 300 || req.status == 304 || req.status == 0){
				success && success(req.responseText);
			}
			else{
				error && error(req.status);
			}
		}
	};
	if(data){
		var resB = [];
		for(var i in data){
			resB.push(encodeURIComponent(i) + "=" + encodeURIComponent(data[i]));
		}
		resA = resB.join("&");
	}
	if(method === "get"){
		if(data){
			url += "?" + resA;
		}
		req.open(method,url,true);
		req.send(null);
	}
	if(method == "post"){
		req.open(method,url,true);
		req.setRequestHeader("Content-type","application/x-www-form-urlencoded");
		req.send(resA);
	}
}


//跨浏览器事件绑定函数addFuc
function addFuc(ele,event,listener){
	if(ele.addEventListener){
		ele.addEventListener(event,listener,false);
	}
	else if(ele.attachEvent){
		ele.attachEvent("on"+event,listener);
	}
	else{
		ele["on"+event] = listener;
	}
}


//判断元素ele是否有className
function hasClass(ele,className){
	var list = ele.className.split(/\s+/);
	for(var i=0; i<list.length; i++){
		if(list[i] == className){
			return true;
		}
	}
	return false;
}

//给元素ele增加一个className
function addClass(ele,className){
	var list = ele.className.split(/\s+/);
	if(!list[0]){
		ele.className = className;
	}
	else{
		ele.className += " " + className;
	}
};

//移除元素ele的className
function removeClass(ele,className){
	var list = ele.className.split(/\s+/);
	if(!list[0]) return;
	for(var i=0; i<list.length; i++){
		if(list[i] == className){
			list.splice(i, 1);
			ele.className = list.join(" ");
		}
	}
};

//通过class获取DOM节点
function getElementsByClassName(element,names){
	if(element.getElementsByClassName){
		return element.getElementsByClassName(names);
	}
	else{
		var list = element.childNodes,
            new_list = [],
            len = list.length;
        for(var i = 0;i<len;i++){
            if(list[i].nodeType == 1 && list[i].getAttribute("class")){
                var arr = list[i].getAttribute("class").split(" "),
                    names_arr = names.split(" "),
                    count = 0;
                for(var j = 0;j<names_arr.length;j++){
                    for(var n = 0;n<arr.length;n++){
                        if(names_arr[j] === arr[n]){
                            count++;
                            if(count == names_arr.length){
                                new_list.push(list[i]);
                            }
                        }
                    }
                }
 
            }
        }
        return new_list;
	}
};


//设置cookie
function setCookie(name, value, days){
	var cookie = encodeURIComponent(name) + "=" + encodeURIComponent(value),
		exp = new Date();
	exp.setTime(exp.getTime() + days*24*60*60*1000);
	cookie += ("; expires=" + exp.toGMTString());
	document.cookie = cookie;
}

//获取cookie
function getCookie(){
	var cookie = {},
		all = document.cookie;
	if(all === "") return cookie;
	var list = all.split("; ");
	for(var i=0; i<list.length; i++){
		var item = list[i],
			p = item.indexOf("="),
			name = item.substring(0,p),
			value = item.substring(p+1);
		name = decodeURIComponent(name);
		value = decodeURIComponent(value);
		cookie[name] = value;
	}
	return cookie;
}


//全局变量
var document =window.document;

// 通知条

//隐藏通知条函数hideTip
function hideTip(){
	var tip = getElementsByClassName(document, "g-tip")[0];
	tip.style.display = "none";
};

// 添加.t-close点击事件，并设置cookie
function closeTip(){
	var tipClose = getElementsByClassName(document,"t-close")[0];
	addFuc(tipClose, "click", function(){
		hideTip();
		setCookie("tipCookie", "tipCookieValue", 30);
	});
};
addLoadEvent(closeTip);

//加载页面前检查cookie
function checkCookie(){
	//如果通知条tipCookie已设置，则不再显示通知条
	if(getCookie().tipCookie){
		hideTip();
	}

	if(getCookie().loginSuc && getCookie().followSuc){
		hideFollow();
		showFollowSuc();
	}
};
addFuc(window, "unbeforeunload",checkCookie());



// 头部

//登录&关注
function logIn(){
	var follow = getElementsByClassName(document, "follow")[0];
	//为关注按钮添加点击事件
	addFuc(follow, "click", function(){
		//先判断登录的loginCookie是否已设置
		if(!getCookie().loginSuc){
			//登录cookie未设置，弹出登录窗口
			showLoginPop();
			//点击登录窗口关闭按钮
			var loginClose = getElementsByClassName(document,"l-close")[0];
			addFuc(loginClose, "click", function(){
				closeLoginPop();
			});
			//点击登录按钮做表单验证,验证成功后ajax提交表单，失败后提示请正确输入
			var loginButton = getElementsByClassName(document,"l-btn")[0];
			addFuc(loginButton, "click", function(){
				//ajax请求登录
				if(validate()){
					ajax(
						//http://study.163.com/webDev/login.htm?userName=ee11cbb19052e40b07aac0ca060c23ee&password=059cbcc266954836d14e2c43c176dd1b
						url = "http://study.163.com/webDev/login.htm",
						data = {
							userName: userName,
							password: password 
						},
						method = "get",
						success = function(res){
							if(res == 1){
								closeLoginPop();
								setCookie("loginSuc", "loginSucValue", 30);
								ajax(
									url = "http://study.163.com/webDev/attention.htm",
									data = {},
									method = "get",
									success = function(res){
										if(res == 1){
											//隐藏关注按钮，显示已关注按钮，并设置followSuc cookie
											hideFollow();
											showFollowSuc();
											setCookie("followSuc", "followSucValue", 30);
										}
									}
									)
							}
						},
						error = function(){alert("登录错误，请重新登录")}
					);
					
				}
			});
		}
		else{
			// 若已设置loginSuc cookie，调用关注API，并设置followSuc cookie
			ajax(
				url = "http://study.163.com/webDev/attention.htm",
				data = {},
				method = "get",
				success = function(){
					hideFollow();
					showFollowSuc();
					setCookie("followSuc", "followSucValue", 30);
				}
			)
		}
	});

	//表单验证，用户名和密码为必填项
	var userName = document.getElementsByName("userName")[0].value,
		password = document.getElementsByName("password")[0].value;
	function validate(){
		if(userName == null || userName == ""){
			alert("请输入用户名");
		}
		else{
			if(password == null || password == ""){
			alert("请输入密码");
			}
			else{
				userName = hex_md5(userName);
				password = hex_md5(password);
				return true;
			}
		}
	}

	//显示登录窗口
	function showLoginPop(){
		getElementsByClassName(document,"g-mask")[0].style.display = "block";
		getElementsByClassName(document,"g-login")[0].style.display = "block";
	}

	//关闭登录窗口
	function closeLoginPop(){
		getElementsByClassName(document,"g-mask")[0].style.display = "none";
		getElementsByClassName(document,"g-login")[0].style.display = "none";
	}

	//隐藏关注按钮
	function hideFollow(){
		getElementsByClassName(document,"follow")[0].style.display = "none";
	}

	//显示已关注按钮
	function showFollowSuc(){
		getElementsByClassName(document,"followSuc")[0].style.display = "block";
	}
};
addLoadEvent(logIn);



// 轮播
function circleImg(){
	var curControl = 0,
		//获取图片组
		bannerArr = getElementsByClassName(document, "g-sld")[0].getElementsByTagName("li"),
		bannerLen = bannerArr.length,
		//获得控制组
		controlArr = getElementsByClassName(document, "sldCtrol")[0].getElementsByTagName("i");
	//设置定时器，5秒自动变换一次banner
	var autoChange = setInterval(function(){
		if(curControl < (bannerLen-1)){
			curControl++;
		}
		else{
			curControl = 0;
		}
		//调用变换处理函数
		changeTo(curControl);
	},5000);

	//调用控制按钮点击和鼠标悬浮事件处理函数
	addEvent();
	function addEvent(){
		for(var i=0; i<bannerLen; i++){
			//闭包，防止作用域内活动对象的影响
			(function(j){
				//控制按钮点击事件
				addFuc(controlArr[j], "click", function(){
					clearInterval(autoChange);
					changeTo(j);
					curControl = j;
					autoChange = setInterval(function(){
						if(curControl < (bannerLen-1)){
							curControl++;
						}
						else{
							curControl = 0;
						}
						changeTo(curControl);
					},5000);
				});
			})(i);
			(function(j){
				//鼠标悬浮图片上方则清除定时器
				addFuc(bannerArr[j],"mouseover",function(){
					clearInterval(autoChange);
					curControl = j;
				});
				//鼠标移出图片则重置定时器
				addFuc(bannerArr[j], "mouseout",function(){
					autoChange = setInterval(function(){
						if(curControl < (bannerLen-1)){
							curControl++;
						}
						else{
							curControl = 0;
						}
						changeTo(curControl);
					},5000);
				});
			})(i);
		}
	}

	//变换处理函数
	function changeTo(num){
		var curBanner = getElementsByClassName(document, "sldOn")[0];
		fadeOut(curBanner);
		removeClass(curBanner, "sldOn");
		addClass(bannerArr[num], "sldOn");
		fadeIn(bannerArr[num]);

		var curControlOn = getElementsByClassName(document, "ctrolOn")[0];
		removeClass(curControlOn, "ctrolOn");
		addClass(controlArr[num], "ctrolOn");
	}

	//淡入处理函数
	function fadeIn(ele){
		setOpacity(ele,0);
		for(var i=0; i<=20; i++){
			(function(){
				var level = i*5;
				setTimeout(function(){
					setOpacity(ele, level);
				},i*25);
			})(i);
		}
	}

	//淡出处理函数
	function fadeOut(ele){
		for(var i=0; i<=20; i++){
			(function(){
				var level = 100-i*5;
				setTimeout(function(){
					setOpacity(ele, level);
				},i*25);
			})(i);
		}
	}

	//透明度设置函数
	function setOpacity(ele, level){
		if(ele.filter){
			ele.style.filter = "alpha(opacity='+level+')";
		}
		else{
			ele.style.opacity = level/100;
		}
	}
}
addLoadEvent(circleImg);


//主内容区

//课程区
function initCourse(pageNo, psize, ptype){
	var rootDom = getElementsByClassName(document, "course");
	//单个课程和详情浮层一起构造
	function bindDOM(opt){
			return '<li class="courseLi"><div class="img"><img src="'
			+opt.middlePhotoUrl+'" alt="课程中图" /></div><div class="title">'
			+opt.name+'</div><div class="orgName">'+opt.provider+'</div><span class="hot">'
			+opt.learnerCount+'</span><div class="discount">¥ <span>'
			+opt.price+'</span></div><div class="mDialog"><div class="uHead"><img src="'
			+opt.middlePhotoUrl+'" alt="课程中图" class="pic" /><div class="uInfo"><h3 class="uTit">'
			+opt.name+'</h3><div class="uHot"><span class="uNum">'
			+opt.learnerCount+'</span>人在学</div><div class="uPub">发布者：<span class="uOri">'
			+opt.provider+'</span></div><div class="uCategory">分类：<span class="uTag">'
			+opt.categoryName+'</span></div></div></div><div class="uIntro">'
			+opt.description+'</div></div></li>';
	}

	//将每页课程写入html
	function courseRender(arr, num){
		var courseTemplate = '';
		for(var i=0; i<num; i++){
			courseTemplate += bindDOM(arr[i]);
		}
		rootDom[0].innerHTML = courseTemplate;
	}

	//ajax请求数据
	ajax(
		url = 'http://study.163.com/webDev/couresByCategory.htm',
		data = {
			pageNo: pageNo,
			psize: psize,
			type: ptype
		},
		method = 'get',
		success = function(res){
			// alert(res);
			var result = JSON.parse(res);
			courseRender(result.list, result.pagination.pageSize);
			//调用页码导航函数
			pagination(result, courseRender, ptype, psize);
			showCourse();
		}
	);
}

//页码导航函数
function pagination(data, render, courseType, size){
	var paginationDom = getElementsByClassName(document, "pagination")[0],
		paginationList = null,
		prevBtn = null,
		nextBtn = null,
		index = 1;
	//切换页码
	function reCourse(n){
		ajax(
			url = 'http://study.163.com/webDev/couresByCategory.htm',
			data = {
				pageNo: n,
				psize: size,
				type: courseType
			},
			method = 'get',
			success = function(res){
				var result = JSON.parse(res);
				render(result.list, result.pagination.pageSize);
				showCourse();
			}
		);
		//页码样式变换
		for(var i=1; i<paginationList.length-1; i++){
			removeClass(paginationList[i],'on');
		}
		addClass(paginationList[n],'on');
	}
	//初始化相关DOM
	paginationList = getElementsByClassName(document, 'ele');
	prevBtn = paginationList[0];
	nextBtn = paginationList[paginationList.length-1];
	//初始化页码1的样式
	addClass(paginationList[1],'on');
	//按钮点击事件
	addFuc(prevBtn, "click", function(){
		if(index>1){
			reCourse(--index);
		}
	});
	addFuc(nextBtn, "click", function(){
		if(index<8){
			reCourse(++index);
		}
	});
	//页码数字点击事件
	for(var i=1; i<paginationList.length-1; i++){
		paginationList[i].id = i;
		addFuc(paginationList[i], "click", function(){
			index = this.id;
			reCourse(this.id);
		});
	}
}

//显示课程详情函数
function showCourse(){
	var courseCell = getElementsByClassName(document, "courseLi");
	for(var i=0; i<courseCell.length; i++){
		addFuc(courseCell[i],"mouseover",function(){
			var dialog = getElementsByClassName(this, "mDialog")[0];
			dialog.style.display = "block";
		});
		addFuc(courseCell[i],"mouseout",function(){
			var dialog = getElementsByClassName(this, "mDialog")[0];
			dialog.style.display = "none";
		});
	}
}

//课程类型切换函数
function tabSwitch(size){
	var productBtn = getElementsByClassName(document, "lesson-tab")[0],
		programBtn = getElementsByClassName(document, "lesson-tab")[1],
		data = null;
	//添加鼠标移入移除事件

	//添加点击事件
	addFuc(productBtn, "click", function(){
		if(hasClass(programBtn, "crt")){
			removeClass(programBtn, "crt");
			addClass(productBtn, "crt");
			initCourse(1,size,10);
		}
	});
	addFuc(programBtn, "click", function(){
		if(hasClass(productBtn, "crt")){
			removeClass(productBtn, "crt");
			addClass(programBtn, "crt");
			initCourse(1,size,20);
		}
	});
	//初始和刷新时自动加载产品设计课程
	initCourse(1,size,10);
}

//自适应窗口大小，调整每页显示课程数
function mainContent(){
	var tag = null;
	if(document.body.clientWidth >= 1205){
		tag=20;
		tabSwitch(20);
	}
	else{
		tag=15;
		tabSwitch(15);
	}
	//根据窗口大小，动态布局
	addFuc(window, "resize", function(){
		if(document.body.clientWidth >= 1205){
			tag=20;
			tabSwitch(20);
		}
		else{
			if(document.body.clientWidth <= 1205){
				tag=15;
				tabSwitch(15);
			}
		}
	});
}
addLoadEvent(mainContent);


//排行榜

//机构介绍，视频弹窗
function videoPlay(){
	var videoImg = getElementsByClassName(document, "videoImg")[0],
		videoClose = getElementsByClassName(document, "v-close")[0];
	addFuc(videoImg, "click", function(){
		showVideoPop();
	});
	addFuc(videoClose, "click", function(){
		hideVideoPop();
	});
	//弹出视频窗口函数
	function showVideoPop(){
		getElementsByClassName(document, "g-mask")[0].style.display = "block";
		getElementsByClassName(document, "showV")[0].style.display = "block";
	}
	//关闭视频窗口
	function hideVideoPop(){
		document.getElementsByTagName("video")[0].pause();
		getElementsByClassName(document, "g-mask")[0].style.display = "none";
		getElementsByClassName(document, "showV")[0].style.display = "none";
	}
}
addLoadEvent(videoPlay);

//最热排行，默认展示前 10 门课程，隔 5 秒更新一门课程， 实现滚动更新热门课程的效果
function showHotList(){
	var returnData = null,
		elementLi = "",
		num = 0,
		elementUl = getElementsByClassName(document, "top-lst")[0];
	//构造单个热门课程
	function createNode(opt){
		return '<img src="' + opt.smallPhotoUrl + '" alt="' + opt.name + '" class="hotListPic"><div><p class="hotListTitle">' + opt.name + '</p><span class="hotListUserCount">' + opt.learnerCount + '</span></div>';
	}
	//ajax请求数据
	ajax(
		url="http://study.163.com/webDev/hotcouresByCategory.htm",
		data={},
		method='get',
		success=function(res){
			returnData=JSON.parse(res);
			for(var i=0; i<10; i++){
				elementLi += '<li class="hotListLi">' + createNode(returnData[i]) + '</li>';
			}
			elementUl.innerHTML = elementLi;
		}
	);
	//每5秒更新一门课
	var updateCourse = setInterval(function func(){
		elementUl.removeChild(elementUl.childNodes[0]);
		var liNode = document.createElement("li");
		liNode.setAttribute("class","hotListLi");
		liNode.innerHTML = createNode(returnData[num]);
		elementUl.appendChild(liNode);
		num == 19 ? num = 0 : num++;
	},5000);
}
addLoadEvent(showHotList);