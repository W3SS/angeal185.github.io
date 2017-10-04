$(document).ready(function(){
var canvas = document.querySelector('#loader');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    var ut, st = Date.now(), um, mouseX = 0, mouseY = 0;

    function initShaders (gl, vertexShaderId, fragmentShaderId) {
        var vertexEl = document.querySelector(vertexShaderId);
        var vertexShader = gl.createShader(gl.VERTEX_SHADER);
        gl.shaderSource(vertexShader, vertexEl.text);
        gl.compileShader(vertexShader);

        var fragmentEl = document.querySelector(fragmentShaderId);
        var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
        gl.shaderSource(fragmentShader, fragmentEl.text);
        gl.compileShader(fragmentShader);

        var program = gl.createProgram();
        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);
        gl.linkProgram(program);
        gl.useProgram(program);

        return program;
    }

    function initGraphics () {
        gl = canvas.getContext('experimental-webgl');
        var width = canvas.width;
        var height = canvas.height;
        gl.viewport(0, 0, width, height);
        
        canvas.addEventListener('mousemove', function (e) {
          mouseX = e.pageX / canvas.width;
          mouseY = e.pageY / canvas.height;
        }, false);
      
        var program = initShaders(gl, '#sv', '#sf');
        var buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);

        gl.bufferData(
                gl.ARRAY_BUFFER,
                new Float32Array([-1, 1, -1, -1, 1, -1, 1, 1]),
                gl.STATIC_DRAW
        );

        var vPosition = gl.getAttribLocation(program, 'vPosition');
        gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(vPosition);

        ut = gl.getUniformLocation(program, 'time');
      um = gl.getUniformLocation(program, 'mouse');
        var resolution = new Float32Array([canvas.width, canvas.height]);
        gl.uniform2fv(gl.getUniformLocation(program, 'resolution'), resolution);
    }

    function render () {
      gl.uniform1f(ut, (Date.now() - st) / 1000);
      gl.uniform2fv(um, new Float32Array([mouseX, mouseY]));
        gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
        requestAnimationFrame(render);
    }

    initGraphics();
    render();
});
function jsonRender_events(e) {
    for (var n = $(document.createElement("i")).html(e.html), t = 0; t < e.events.length; t++) {
        var r = e.events[t],
            i = $(n).find("[jsonRender-event-id-" + r.type + "='" + r.id + "']");
        if (0 === i.length) throw "unable to attach event " + r.id + " to DOM";
        $(i).removeAttr("jsonRender-event-id-" + r.type), $(i).on(r.type, r.data, function(e) {
            e.data.event = e, e.data.action.call($(this), e.data);
        });
    }
    return $(n).children();
}
var jsonRender = {
    transform: function(e, n, t) {
        var r = {
                events: [],
                html: ""
            },
            i = {
                events: !1
            };
        if (i = jsonRender._extend(i, t), void 0 !== n || void 0 !== e) {
            var s = "string" == typeof e ? JSON.parse(e) : e;
            r = jsonRender._transform(s, n, i);
        }
        return i.events ? r : r.html;
    },
    _extend: function(e, n) {
        var t = {};
        for (var r in e) t[r] = e[r];
        for (var r in n) t[r] = n[r];
        return t;
    },
    _append: function(e, n) {
        var t = {
            html: "",
            event: []
        };
        return "undefined" != typeof e && "undefined" != typeof n && (t.html = e.html + n.html, t.events = e.events.concat(n.events)), t;
    },
    _isArray: function(e) {
        return "[object Array]" === Object.prototype.toString.call(e);
    },
    _transform: function(e, n, t) {
        var r = {
            events: [],
            html: ""
        };
        if (jsonRender._isArray(e))
            for (var i = e.length, s = 0; i > s; ++s) r = jsonRender._append(r, jsonRender._apply(e[s], n, s, t));
        else "object" == typeof e && (r = jsonRender._append(r, jsonRender._apply(e, n, void 0, t)));
        return r;
    },
    _apply: function(e, n, t, r) {
        var i = {
            events: [],
            html: ""
        };
        if (jsonRender._isArray(n))
            for (var s = n.length, o = 0; s > o; ++o) i = jsonRender._append(i, jsonRender._apply(e, n[o], t, r));
        else if ("object" == typeof n) {
            var a = "<>";
            if (void 0 === n[a] && (a = "tag"), void 0 !== n[a]) {
                var d = jsonRender._getValue(e, n, a, t);
                i.html += "<" + d;
                var f, l = {
                    events: [],
                    html: ""
                };
                for (var u in n) switch (u) {
                    case "tag":
                    case "<>":
                        break;
                    case "children":
                    case "html":
                        var v = n[u];
                        if (jsonRender._isArray(v)) l = jsonRender._append(l, jsonRender._apply(e, v, t, r));
                        else if ("function" == typeof v) {
                            var c = v.call(e, e, t);
                            switch (typeof c) {
                                case "object":
                                    void 0 !== c.html && void 0 !== c.events && (l = jsonRender._append(l, c));
                                    break;
                                case "function":
                                case "undefined":
                                    break;
                                default:
                                    l.html += c;
                            }
                        } else f = jsonRender._getValue(e, n, u, t);
                        break;
                    default:
                        var h = !1;
                        if (u.length > 2 && "on" == u.substring(0, 2).toLowerCase()) {
                            if (r.events) {
                                var p = {
                                        action: n[u],
                                        obj: e,
                                        data: r.eventData,
                                        index: t
                                    },
                                    j = jsonRender._guid();
                                i.events[i.events.length] = {
                                    id: j,
                                    type: u.substring(2),
                                    data: p
                                }, i.html += " jsonRender-event-id-" + u.substring(2) + "='" + j + "'";
                            }
                            h = !0;
                        }
                        if (!h) {
                            var m = jsonRender._getValue(e, n, u, t);
                            if (void 0 !== m) {
                                var R;
                                R = "string" == typeof m ? '"' + m.replace(/"/g, "&quot;") + '"' : m, i.html += " " + u + "=" + R;
                            }
                        }
                }
                i.html += ">", f && (i.html += f), i = jsonRender._append(i, l), i.html += "</" + d + ">";
            }
        }
        return i;
    },
    _guid: function() {
        var e = function() {
            return (65536 * (1 + Math.random()) | 0).toString(16).substring(1);
        };
        return e() + e() + "-" + e() + e() + "-" + e() + e();
    },
    _getValue: function(e, n, t, r) {
        var i = "",
            s = n[t],
            o = typeof s;
        if ("function" === o) return s.call(e, e, r);
        if ("string" === o) {
            var a = new jsonRender._tokenizer([/\$\{([^\}\{]+)\}/], function(n, t, r) {
                return t ? n.replace(r, function(n, t) {
                    for (var r = t.split("."), i = e, s = "", o = r.length, a = 0; o > a; ++a)
                        if (r[a].length > 0) {
                            var d = i[r[a]];
                            if (i = d, null === i || void 0 === i) break;
                        }
                    return null !== i && void 0 !== i && (s = i), s;
                }) : n;
            });
            i = a.parse(s).join("");
        } else i = s;
        return i;
    },
    _tokenizer: function(e, n) {
        return this instanceof jsonRender._tokenizer ? (this.tokenizers = e.splice ? e : [e], n && (this.doBuild = n), this.parse = function(e) {
            this.src = e, this.ended = !1, this.tokens = [];
            do this.next(); while (!this.ended);
            return this.tokens;
        }, this.build = function(e, n) {
            e && this.tokens.push(this.doBuild ? this.doBuild(e, n, this.tkn) : e);
        }, this.next = function() {
            var e, n = this;
            n.findMin(), e = n.src.slice(0, n.min), n.build(e, !1), n.src = n.src.slice(n.min).replace(n.tkn, function(e) {
                return n.build(e, !0), "";
            }), n.src || (n.ended = !0);
        }, void(this.findMin = function() {
            var e, n, t = this,
                r = 0;
            for (t.min = -1, t.tkn = ""; void 0 !== (e = t.tokenizers[r++]);) n = t.src[e.test ? "search" : "indexOf"](e), -1 != n && (-1 == t.min || n < t.min) && (t.tkn = e, t.min = n); - 1 == t.min && (t.min = t.src.length);
        })) : new jsonRender._tokenizer(e, n);
    }
};
! function(e) {
    e.jsonRender = function(n, t, r) {
        if ("undefined" == typeof jsonRender) return void 0;
        var i = {
            output: "jsonRender"
        };
        switch (void 0 !== r && e.extend(i, r), i.output) {
            case "jsonRender":
                return i.events = !0, jsonRender.transform(n, t, i);
            case "html":
                return i.events = !1, jsonRender.transform(n, t, i);
            case "jquery":
                i.events = !1;
                var s = jsonRender_events(jsonRender.transform(n, t, i));
                return s;
        }
    }, e.fn.jsonRender = function(n, t, r) {
        if ("undefined" == typeof jsonRender) return void 0;
        var i = {
            append: !0,
            replace: !1,
            prepend: !1,
            eventData: {}
        };
        return void 0 !== r && e.extend(i, r), i.events = !0, this.each(function() {
            var r = jsonRender_events(jsonRender.transform(n, t, i));
            i.replace ? e.fn.replaceWith.call(e(this), r) : i.prepend ? e.fn.prepend.call(e(this), r) : e.fn.append.call(e(this), r);
        });
    };
}(jQuery);
var sidebarData={},mainContentData={},menuData=[{title:"PROFILE",idProj:"skills",idTemp:"resume",item1:"Skills",item2:"Resume"},{title:"NODEJS",idProj:"h-p",idTemp:"h-t",item1:"Projects",item2:""},{title:"JAVASCRIPT",idProj:"j-p",idTemp:"j-t",item1:"Projects",item2:"Codepen-list"},{title:"PYTHON",idProj:"py-p",idTemp:"py-t",item1:"Projects",item2:""},{title:"PHP",idProj:"p-p",item1:"Projects"},{title:"CSS",idProj:"c-s",item1:"Stylus"}],headerMainRightData=[{href:"#",id:"wbs1",class:"icon-bolt shrink",time:"7s",dataTip:""},{href:"http://codepen.io/angeal185/",id:"cdpt",class:"icon-codepen shrink",time:"6s",dataTip:"My codepen"},{href:"https://au.linkedin.com/in/ben-eaves-996991125",id:"lndt",class:"icon-linkedin shrink",time:"5s",dataTip:"My linkedin"}],indexHeader=[{title:"DASHBOARD",sub:""}],nodejsProj=[{title:"NODEJS",sub:"PROJECTS"}],javascriptProj=[{title:"JAVASCRIPT",sub:"PROJECTS"}],javascriptTemp=[{title:"JAVASCRIPT",sub:"CODEPEN"}],pythonProj=[{title:"PYTHON",sub:"PROJECTS"}],phpProj=[{title:"PHP",sub:"PROJECTS"}],stylusProj=[{title:"STYLUS",sub:"PROJECTS"}],timelineHeader=[{title:"TIMELINE",sub:""}],skillsProj=[{title:"PROFILE",sub:"SKILLS"}],resumeProj=[{title:"PROFILE",sub:"RESUME"}],javascriptTemplates=[{name:"",img:"app/images/codepen-logo.svg",title:"",sub:"",btnA:"Code",hrefA:""},{name:"",img:"app/images/codepen-logo.svg",title:"",sub:"",btnA:"Code",hrefA:""},{name:"",img:"app/images/codepen-logo.svg",title:"",sub:"",btnA:"Code",hrefA:""},{name:"",img:"app/images/codepen-logo.svg",title:"",sub:"",btnA:"Code",hrefA:""},{name:"",img:"app/images/codepen-logo.svg",title:"",sub:"",btnA:"Code",hrefA:""},{name:"",img:"app/images/codepen-logo.svg",title:"",sub:"",btnA:"Code",hrefA:""},{name:"",img:"app/images/codepen-logo.svg",title:"",sub:"",btnA:"Code",hrefA:""},{name:"",img:"app/images/codepen-logo.svg",title:"",sub:"",btnA:"Code",hrefA:""},{name:"",img:"app/images/codepen-logo.svg",title:"",sub:"",btnA:"Code",hrefA:""},{name:"",img:"app/images/codepen-logo.svg",title:"",sub:"",btnA:"Code",hrefA:""},{name:"",img:"app/images/codepen-logo.svg",title:"",sub:"",btnA:"Code",hrefA:""}],skillsTemplateData=[{title:"CODE SKILLS",idLeft:"codeLeft",idRight:"codeRight",subtitle:"A list of the code that i am most familiar with"},{title:"FRAMEWORKS",idLeft:"skillsLeft",idRight:"skillsRight",subtitle:"A list of the frameworks that i am most familiar with"},{title:"DB SKILLS",idLeft:"dbLeft",idRight:"dbRight",subtitle:"A list of the db types that i am most familiar with"},{title:"CMS SKILLS",idLeft:"CMSLeft",idRight:"CMSRight",subtitle:"CMS development and design"},{title:"OS SKILLS",idLeft:"OSLeft",idRight:"OSRight",subtitle:"A list of the OS types that i am most familiar with"},{title:"OTHER SKILLS",idLeft:"otherLeft",idRight:"otherRight",subtitle:"A list of other skills that i am most familiar with"},{title:"API SKILLS",idLeft:"APILeft",idRight:"APIRight",subtitle:"A list of API's that i am familiar with"}],codeLeftData=[{title:"JAVASCRIPT",percent:"95"},{title:"NODEJS",percent:"95"},{title:"CSS",percent:"100"},{title:"STYLUS",percent:"100"},{title:"XML",percent:"70"},{title:"PHP",percent:"50"},{title:"BASH",percent:"80"},{title:"PUG",percent:"70"},{title:"DUST",percent:"70"},{title:"HANDLEBARS",percent:"95"},{title:"MUSTACHE",percent:"70"},{title:"COFFEESCRIPT",percent:"90"}],codeRightData=[{title:"HTML",percent:"100"},{title:"PYTHON",percent:"90"},{title:"JSON",percent:"90"},{title:"SCSS",percent:"80"},{title:"LESS",percent:"80"},{title:"CMD",percent:"80"},{title:"NUNJUCKS",percent:"100"},{title:"JINJA",percent:"100"},{title:"DJANGO-TPL",percent:"90"},{title:"TWIG",percent:"90"},{title:"EJS",percent:"80"},{title:"BABEL",percent:"70"}],skillsLeftData=[{title:"JQUERY",percent:"100"},{title:"ANGULAR.JS",percent:"100"},{title:"SOCKET.IO",percent:"90"},{title:"SAILS.JS",percent:"90"},{title:"TOTAL.JS",percent:"90"},{title:"HAPI.JS",percent:"80"},{title:"KOA.JS",percent:"75"},{title:"ADONIS.JS",percent:"85"},{title:"THREE.JS",percent:"70"},{title:"GREENSOCK",percent:"70"},{title:"KNOCKOUT.js",percent:"75"},{title:"TWEEN.JS",percent:"70"},{title:"DJANGO",percent:"80"},{title:"WEB2PY",percent:"80"},{title:"JQUERYMOBILE",percent:"90"},{title:"CATBERRY",percent:"70"},{title:"WE.JS",percent:"70"},{title:"CODEIGNITER",percent:"55"},{title:"SEMANTIC",percent:"90"},{title:"UIKIT",percent:"90"},{title:"MATERIALIZE",percent:"90"}],skillsRightData=[{title:"MEAN.IO",percent:"95"},{title:"EXPRESS.JS",percent:"95"},{title:"MEAN.JS",percent:"95"},{title:"EMBER.JS",percent:"90"},{title:"METEOR",percent:"80"},{title:"DERBY.JS",percent:"80"},{title:"IONIC",percent:"95"},{title:"CORDOVA",percent:"90"},{title:"FLASK",percent:"100"},{title:"JQUERYUI",percent:"90"},{title:"REACTIVE.JS",percent:"80"},{title:"POLYMER",percent:"70"},{title:"VUE.JS",percent:"70"},{title:"BACKBONE",percent:"65"},{title:"KEYSTONE",percent:"90"},{title:"MITHRIL",percent:"70"},{title:"SYMFONY",percent:"55"},{title:"LARAVEL",percent:"50"},{title:"BOOTSTRAP",percent:"100"},{title:"FOUNDATION",percent:"85"},{title:"SKELETON",percent:"70"}],dbLeftData=[{title:"MONGODB",percent:"90"},{title:"COUCHDB",percent:"80"},{title:"MYSQL",percent:"65"},{title:"REDIS",percent:"70"}],dbRightData=[{title:"SQLITE",percent:"80"},{title:"NOSQL EMBEDDED DB",percent:"80"},{title:"REASONDB",percent:"60"},{title:"POSTGRESQL",percent:"60"}],CMSLeftData=[{title:"CODY",percent:"90"},{title:"TARACOT",percent:"80"},{title:"KEYSTONE CMS",percent:"90"},{title:"PENCILBLUE",percent:"80"},{title:"DJANGO CMS",percent:"95"},{title:"OCTOBER CMS",percent:"80"},{title:"PHPBB",percent:"80"},{title:"GRAV",percent:"95"},{title:"WAGTAIL",percent:"70"},{title:"GHOST",percent:"100"},{title:"OXWALL",percent:"60"},{title:"MAGENTO",percent:"65"}],CMSRightData=[{title:"APOSTROPHE",percent:"90"},{title:"ULBORA",percent:"80"},{title:"NODEBB",percent:"85"},{title:"MEZZANINE",percent:"90"},{title:"WORDPRESS",percent:"80"},{title:"DRUPAL",percent:"70"},{title:"JOOMLA",percent:"65"},{title:"BOLT",percent:"80"},{title:"MODX",percent:"80"},{title:"MOODLE",percent:"85"},{title:"PYRO",percent:"65"},{title:"OPENCART",percent:"65"}],OSLeftData=[{title:"UBUNTU",percent:"90"},{title:"SUSE",percent:"80"},{title:"FENDORA",percent:"70"},{title:"KALI",percent:"80"}],OSRightData=[{title:"WINDOWS(ALL)",percent:"100"},{title:"OSX",percent:"50"},{title:"DEBIAN",percent:"70"},{title:"MINT",percent:"60"}],otherLeftData=[{title:"GULP"},{title:"NPM"},{title:"COMPOSER"},{title:"SEO"},{title:"AWS"},{title:"DOCKER"},{title:"DIGITALOCEAN"},{title:"AZURE"},{title:"BITBUCKET"},{title:"SOAP"},{title:"WAMP STACk"},{title:"LAMP STACK"},{title:"DEVOPS"},{title:"TRAVIS CI"}],otherRightData=[{title:"GRUNT"},{title:"BOWER"},{title:"WEBPACK"},{title:"REST"},{title:"HEROKU"},{title:"BITNAMI"},{title:"FIREBASE"},{title:"GITHUB"},{title:"GITLAB"},{title:"STORMPATH"},{title:"OKTA"},{title:"MVC/MVVM/MVP"},{title:"YEOMAN"},{title:"SLACK"}],APILeftData=[{title:"FACEBOOK API"},{title:"TWITTER API"},{title:"GITHUB API"},{title:"PINTEREST API"},{title:"PAYPAL API"},{title:"SNIPCART API"},{title:"CODEPEN API"},{title:"DISQUS API"},{title:"UNSPLASH API"},{title:"OPENWEATHER API"},{title:"TAWK.TO API"},{title:"HACKERNEWS API"}],APIRightData=[{title:"LINKEDIN API"},{title:"GOOGLE API"},{title:"YOUTUBE API"},{title:"VIMEO API"},{title:"FLICKR API"},{title:"AMAZON API"},{title:"EBAY API"},{title:"INSTAGRAM API"},{title:"FIXER.IO API"},{title:"REDDIT API"},{title:"LIVEFYRE API"},{title:"DISCOURSE API"}],resumeData=[{title:"Employment History",title2:"Academic Achievements"}],workData=[{date:" CURRENT - 2013",title:"University Lecturer - computer science",location:"Xingtai University China",about:"<h3 class='c-primary'>Lecture classes on languages and framework ops including:</h3><ul><li class='ani fadeIn animated'><h4>javascript</h4></li><li class='ani fadeIn animated'><h4>node.js</h4></li><li class='ani fadeIn animated'><h4>python</h4></li><li class='ani fadeIn animated'><h4>ajax</h4></li><li class='ani fadeIn animated'><h4>angular.js</h4></li><li class='ani fadeIn animated'><h4>jquery</h4></li><li class='ani fadeIn animated'><h4>express</h4></li></ul>"},{date:" CURRENT - 2006",title:"Freelance Web Development",location:"",about:"<h3 class='c-primary'>Web Development including:</h3><ul><li class='ani fadeIn animated'><h4>node.js site development</h4></li><li class='ani fadeIn animated'><h4>node.js App development</h4></li><li class='ani fadeIn animated'><h4>ajax site development</h4></li><li class='ani fadeIn animated'><h4>flask site development</h4></li><li class='ani fadeIn animated'><h4>django site development</h4></li><li class='ani fadeIn animated'><h4>angular.js site development</h4></li><li class='ani fadeIn animated'><h4>cordova App development</h4></li><li class='ani fadeIn animated'><h4>ionic App development</h4></li><li class='ani fadeIn animated'><h4>jquery App development</h4></li><li class='ani fadeIn animated'><h4>jquery mobile App development</h4></li><li class='ani fadeIn animated'><h4>jqueryUI App development</h4></li></ul><h3 class='c-primary'>CMS development including:</h3><ul><li class='ani fadeIn animated'><h4>custom cms development</h4></li><li class='ani fadeIn animated'><h4>django cms site development</h4></li><li class='ani fadeIn animated'><h4>drupal site development</h4></li><li class='ani fadeIn animated'><h4>ghost site development</h4></li><li class='ani fadeIn animated'><h4>apostrophe site development</h4></li><li class='ani fadeIn animated'><h4>grav site development</h4></li><li class='ani fadeIn animated'><h4>bolt cms site development</h4></li><li class='ani fadeIn animated'><h4>joomla site development</h4></li><li class='ani fadeIn animated'><h4>keystone.js site development</h4></li><li class='ani fadeIn animated'><h4>magento site development</h4></li><li class='ani fadeIn animated'><h4>mezzanine site development</h4></li><li class='ani fadeIn animated'><h4>modX site development</h4></li><li class='ani fadeIn animated'><h4>moodle site development</h4></li><li class='ani fadeIn animated'><h4>nodebb site development</h4></li><li class='ani fadeIn animated'><h4>october cms site development</h4></li><li class='ani fadeIn animated'><h4>opencart site development</h4></li><li class='ani fadeIn animated'><h4>oxwall site development</h4></li><li class='ani fadeIn animated'><h4>pencilblue site development</h4></li><li class='ani fadeIn animated'><h4>phpbb site development</h4></li><li class='ani fadeIn animated'><h4>ulbora site development</h4></li><li class='ani fadeIn animated'><h4>wigtail site development</h4></li><li class='ani fadeIn animated'><h4>wordpress site developmen</h4></li></ul>"},{date:" 2010 - 2009",title:"Computer Science Internship",location:"Munich University of Applied Sciences Germany",about:"<h3 class='c-primary'>Web Development including:</h3><ul><li class='ani fadeIn animated'><h4>DevOps</h4></li><li class='ani fadeIn animated'><h4>debugging</h4></li><li class='ani fadeIn animated'><h4>assist in lectures</h4></li><li class='ani fadeIn animated'><h4>ajax site development</h4></li><li class='ani fadeIn animated'><h4>flask site development</h4></li><li class='ani fadeIn animated'><h4>django site development</h4></li><li class='ani fadeIn animated'><h4>jquery App development</h4></li><li class='ani fadeIn animated'><h4>jquery mobile App development</h4></li><li class='ani fadeIn animated'><h4>jqueryUI App development</h4></li></ul>"}],eduData=[{date:" 2012 - 2010",title:"Master of Computer Science",location:"University of Newcastle, Sydney, Australia"},{date:" 2008 - 2005",title:"Bachelor's Degree in Computer Science",location:"University of Newcastle, Sydney, Australia"}],sidebar={"<>":"div",class:"sidebar",html:[{"<>":"div",class:"logopanel",html:[{"<>":"h1",style:"text-align:center",html:"GITHUB"}]},{"<>":"div",class:"sidebar-inner",html:[{"<>":"div",class:"sidebar-top small-img clearfix",style:"display: block",html:[{"<>":"div",class:"user-image",html:[{"<>":"img",id:"imgh",html:""}]},{"<>":"div",class:"user-details",html:[{"<>":"h4",html:"ANGEAL"},{"<>":"div",id:"usr",class:"user-login",html:""}]}]},{"<>":"div",class:"menu-title",html:[{"<>":"span",html:"Navigation"},{"<>":"div",class:"pull-right menu-settings",html:[{"<>":"a",id:"hide-top-sidebar",title:"hide",class:"hide-top-sidebar",html:[{"<>":"i",class:"icon-cog",html:""}]}]}]},{"<>":"ul",id:"menu",class:"nav nav-sidebar",html:[{"<>":"li",class:"tm nav-parent",html:[{"<>":"a",id:"indx",html:[{"<>":"i",class:"icon-tachometer c-primary shrink",html:""},{"<>":"span",class:"shrink",html:"Index"}]}]}]},{"<>":"div",html:""},{"<>":"div",class:"sidebar-footer clearfix",html:[{"<>":"a",src:"app/images/avatars/github.png",id:"fsc",class:"pull-left toggle_fullscreen shrink",title:"fullscreen",html:[{"<>":"i",class:"icon-arrows-alt",html:""}]}]}]}]},mainContent={"<>":"div",class:"main-content",html:[{"<>":"div",class:"topbar",html:[{"<>":"div",class:"header-left",style:"display: block",html:[{"<>":"div",class:"topnav",html:[{"<>":"a",class:"menutoggle","data-toggle":"sidebar-collapsed",html:[{"<>":"span",class:"menu__handle",html:[{"<>":"span",html:"Menu"}]}]}]},{"<>":"ul",id:"headerLeft",class:"header-menu nav navbar-nav",html:""}]},{"<>":"div",class:"topnav",html:[{"<>":"div",class:"header-right",html:[{"<>":"ul",id:"headerRight",class:"header-menu nav navbar-nav",html:""}]}]}]},{"<>":"div",id:"pagecontainer",html:""},{"<>":"div",id:"footer",class:"copyright col-md-12",html:""},{"<>":"a",class:"scrollup shrink",html:[{"<>":"i",class:"icon-angle-up",html:""}]}]},menu={"<>":"li",class:"tm nav-parent",html:[{"<>":"a",html:[{"<>":"i",class:"icon-code c-fourth shrink",html:""},{"<>":"span",class:"shrink",html:"${title}"},{"<>":"span",class:"arrow shrink",html:""}]},{"<>":"ul",class:"children collapse",html:[{"<>":"li",html:[{"<>":"a",id:"${idProj}",html:"${item1}"}]},{"<>":"li",html:[{"<>":"a",id:"${idTemp}",html:"${item2}"}]}]}]},headerMain={"<>":"li",html:[{"<>":"a",href:"${href}",target:"_blank",html:[{"<>":"i",id:"${id}",class:"${class}","data-ani-delay":"${time}","data-tip":"${dataTip}",html:""}]}]},header={"<>":"div",class:"row",html:[{"<>":"div",class:"col-md-12",html:[{"<>":"div",class:"header",html:[{"<>":"h2",class:"c-primary",html:"${title}:${sub}"},{"<>":"div",class:"breadcrumb-wrapper",html:[{"<>":"ol",class:"breadcrumb",html:[{"<>":"li",class:"c-third",html:"${title}"}]}]},{"<>":"p",style:"display: block",html:"${title} ${sub} LIST"}]}]}]},template={"<>":"div",class:"row",html:[{"<>":"div",class:"col-md-6",html:[{"<>":"div",class:"fileinput fileinput-new","data-provides":"fileinput",html:[{"<>":"div",class:"text",html:[{"<>":"img",class:"img-demo",src:"${img}",html:"${name}"}]}]}]},{"<>":"div",class:"col-md-6",html:[{"<>":"div",class:"panel",html:[{"<>":"div",class:"panel-content",html:[{"<>":"h3",class:"c-primary",html:"${title}"},{"<>":"p",class:"m-t-40",html:"${sub}"}]},{"<>":"div",class:"panel-footer clearfix",html:[{"<>":"div",class:"pull-right",html:[{"<>":"a",href:"${hrefA}",target:"_blank",html:[{"<>":"button",type:"button",class:"btn btn-white m-r-10 shrink",formaction:"${hrefA}",html:"${btnA}"}]}]}]}]}]}]},skillsTemplate=[{"<>":"h2",class:"skills-title c-primary  ani fadeIn",html:"${title}"},{"<>":"h3",class:"skills-title",html:"${subtitle}"},{"<>":"div",class:"row",html:[{"<>":"div",class:"col-md-6",html:[{"<>":"ul",id:"${idLeft}",class:"skillsBar",html:""}]},{"<>":"div",class:"col-md-6",html:[{"<>":"ul",id:"${idRight}",class:"skillsBar",html:""},{"<>":"br",html:""}]}]}],skills={"<>":"li",class:"ani fadeIn",html:[{"<>":"h4",html:"${title}"},{"<>":"div",class:"bar_container",html:[{"<>":"span",class:"bar","data-bar":"{}",html:[{"<>":"span",class:"pct",html:"${percent}%"}]}]}]},apiSkills={"<>":"li",class:"ani fadeIn animated",html:[{"<>":"h4",html:"${title}"},{"<>":"hr",html:""}]},resume={"<>":"div",class:"row panel",style:"padding: 100px;margin-top: 200px;",html:[{"<>":"div",class:"col-md-12 col-sm-12",style:"height:40px;",html:""},{"<>":"div",class:"container",html:[{"<>":"div",class:"text-center ani fadeIn",html:[{"<>":"h2",class:"c-primary",html:"Ben Eaves"},{"<>":"br",html:""},{"<>":"h2",html:"${title}"}]},{"<>":"hr",html:""}]},{"<>":"div",class:"container",html:[{"<>":"div",id:"work",html:""}]},{"<>":"div",class:"container",html:[{"<>":"div",class:"text-center",html:[{"<>":"h2",html:"${title2}"}]},{"<>":"hr",html:""}]},{"<>":"div",class:"container",html:[{"<>":"div",id:"edu",html:""}]}]},work=[{"<>":"div",class:"block",html:[{"<>":"h3",html:"${date}"},{"<>":"h2",class:"ani fadeIn c-primary",html:"${title}"},{"<>":"p",html:"${location}"},{"<>":"H3",html:"Responsibilities"},{"<>":"div",html:"${about}"}]},{"<>":"br",html:""},{"<>":"br",html:""}],edu={"<>":"div",class:"block",html:[{"<>":"h3",html:"${date}"},{"<>":"h2",class:" ani  fadeIn c-primary",html:"${title}"},{"<>":"p",html:"${location}"},{"<>":"br",html:""},{"<>":"br",html:""}]},codePenTpl=[{"<>":"div",class:"row text",style:"width: 100%;margin:50px 0;",html:[{"<>":"img",class:"img-demo",src:"app/images/codepen-logo.svg",html:""}]},{"<>":"div",class:"container panel list-view pen-grid",style:"padding:60px",html:[{"<>":"div",class:"pens-in-list-view-wrap",html:[{"<>":"table",class:"pens-in-list-view",html:[{"<>":"thead",html:[{"<>":"tr",html:[{"<>":"th",class:"title-header",html:"Codepen Portfolio"},{"<>":"th",class:"sort-created_at",html:"Created"},{"<>":"th",class:"sort-updated_at sorted_desc",html:"Last Updated"}]}]},{"<>":"tbody",id:"codePen",html:""}]}]}]}],codePen={"<>":"tr",class:"pen-in-list-view",html:[{"<>":"td",class:"title",html:[{"<>":"a",href:"${href}",target:"_blank",html:"${name}"}]},{"<>":"td",class:"date",title:"Created on ${date}",html:"${date}"},{"<>":"td",class:"date",title:"Last updated on ${update}",html:"${update}"}]},codePenTplData=[{}],codePenData=[{href:"http://codepen.io/angeal185/pen/wWbXWw",name:"image zoom",date:"August 23, 2016",update:"November 16, 2016"},{href:"http://codepen.io/angeal185/pen/ZBNVVN",name:"animated canvas bubbles",date:"December 26, 2016",update:"January 25, 2017"},{href:"http://codepen.io/angeal185/pen/rLgGLj",name:"bootstrap social login with particle background",date:"August 22, 2016",update:"October 11, 2016"},{href:"http://codepen.io/angeal185/pen/ozoxzd",name:"animated canvas backgrounds",date:"October 03, 2016",update:"October 11, 2016"},{href:"http://codepen.io/angeal185/pen/bZyoaE",name:"social icons",date:"August 22, 2016",update:"October 10, 2016"},{href:"http://codepen.io/angeal185/pen/ZpjdpN",name:"jquery overlay menu",date:"October 15, 2016",update:"October 15, 2016"},{href:"http://codepen.io/angeal185/pen/dXmPPm",name:"Sidebar Animations",date:"July 20, 2016",update:"December 24, 2016"},{href:"http://codepen.io/angeal185/pen/ZONAdo",name:"transitional hover overlay effects",date:"August 23, 2016",update:"October 11, 2016"},{href:"http://codepen.io/angeal185/pen/ozvzKY",name:"Js Ken Burns",date:"August 30, 2016",update:"December 26, 2016"},{href:"http://codepen.io/angeal185/pen/dpyLYA",name:"interactive site map",date:"September 03, 2016",update:"December 23, 2016"},{href:"http://codepen.io/angeal185/pen/vXaoga",name:"jquery folding panel",date:"October 15, 2016",update:"January 03, 2017"},{href:"http://codepen.io/angeal185/pen/WRgNBJ",name:"blood cell animated canvas",date:"February 07, 2017",update:"February 08, 2017"},{href:"http://codepen.io/angeal185/pen/rrAYOR",name:"jquery sliding menu",date:"October 14, 2016",update:"October 15, 2016"},{href:"http://codepen.io/angeal185/pen/EyzmrZ",name:"css image display spinner",date:"August 22, 2016",update:"October 11, 2016"},{href:"http://codepen.io/angeal185/pen/JKqyaJ",name:"bootstrap login form",date:"August 22, 2016",update:"January 12, 2017"},{href:"http://codepen.io/angeal185/pen/akAwRb",name:"responsive transitional css image grid",date:"August 22, 2016",update:"October 10, 2016"},{href:"http://codepen.io/angeal185/pen/rLgzmN",name:"bootstrap mobile responsive menu",date:"August 22, 2016",update:"October 11, 2016"},{href:"http://codepen.io/angeal185/pen/jrzvBL",name:"hover blur effect",date:"October 10, 2016",update:"December 23, 2016"},{href:"http://codepen.io/angeal185/pen/YGOqKg",name:"animated dots jquery canvas plugin",date:"October 16, 2016",update:"October 28, 2016"},{href:"http://codepen.io/angeal185/pen/NAQjWo",name:"jquery slider",date:"August 27, 2016",update:"November 08, 2016"},{href:"http://codepen.io/angeal185/pen/PGMKZy",name:"jquery slide down navigation",date:"November 01, 2016",update:"November 01, 2016"},{href:"http://codepen.io/angeal185/pen/XKwZGY",name:"bootstrap social hover links",date:"August 22, 2016",update:"October 11, 2016"},{href:"http://codepen.io/angeal185/pen/dpmjxA",name:"jquery sliding side panel",date:"October 10, 2016",update:"October 10, 2016"},{href:"http://codepen.io/angeal185/pen/ZONXEL",name:"bootstrap contact form",date:"August 22, 2016",update:"October 12, 2016"},{href:"http://codepen.io/angeal185/pen/ALPEdR",name:"Embeded content Popup Modal",date:"October 16, 2016",update:"October 16, 2016"},{href:"http://codepen.io/angeal185/pen/XjVzqP",name:"css only button animations",date:"October 05, 2016",update:"October 11, 2016"},{href:"http://codepen.io/angeal185/pen/ObJpPz",name:"Random Javascript password generator",date:"November 04, 2016",update:"November 04, 2016"},{href:"http://codepen.io/angeal185/pen/vKRaEX",name:"AES JS Encryption APP",date:"July 21, 2016",update:"October 10, 2016"},{href:"http://codepen.io/angeal185/pen/bwLVYZ",name:"icon glitch on hover",date:"October 06, 2016",update:"January 31, 2017"},{href:"http://codepen.io/angeal185/pen/zBQzjV",name:"balls",date:"August 22, 2016",update:"October 17, 2016"},{href:"http://codepen.io/angeal185/pen/grJKEp",name:"css animated clouds",date:"August 23, 2016",update:"October 11, 2016"},{href:"http://codepen.io/angeal185/pen/xEPVvy",name:"icon menu",date:"October 03, 2016",update:"October 11, 2016"},{href:"http://codepen.io/angeal185/pen/bBdXWr",name:"simple jquery slider",date:"November 08, 2016",update:"November 08, 2016"},{href:"http://codepen.io/angeal185/pen/RRrxrv",name:"Hex to Decimal",date:"July 21, 2016",update:"October 16, 2016"},{href:"http://codepen.io/angeal185/pen/RoNYMg",name:"jquery responsive image grid",date:"November 07, 2016",update:"November 07, 2016"},{href:"http://codepen.io/angeal185/pen/wzwrOj",name:"particleBlur",date:"August 30, 2016",update:"October 11, 2016"},{href:"http://codepen.io/angeal185/pen/rrpJVa",name:"hamburger menu toggle animations",date:"October 05, 2016",update:"October 15, 2016"},{href:"http://codepen.io/angeal185/pen/OXZmjZ",name:"JS Hangman",date:"August 25, 2016",update:"October 11, 2016"},{href:"http://codepen.io/angeal185/pen/LRBGxm",name:"simple signup form",date:"October 14, 2016",update:"October 15, 2016"},{href:"http://codepen.io/angeal185/pen/jrPORb",name:"js loader",date:"September 07, 2016",update:"October 11, 2016"},{href:"http://codepen.io/angeal185/pen/QERxPp",name:"QERxPp",date:"August 23, 2016",update:"October 11, 2016"},{href:"http://codepen.io/angeal185/pen/LbYyZd",name:"jquery animated login form",date:"November 04, 2016",update:"November 04, 2016"},{href:"http://codepen.io/angeal185/pen/KrLBqo",name:"link animate on hover",date:"August 23, 2016",update:"November 06, 2016"},{href:"http://codepen.io/angeal185/pen/oYgGxo",name:"particle animation",date:"November 06, 2016",update:"November 07, 2016"},{href:"http://codepen.io/angeal185/pen/dpyLWB",name:"gradient bubble animation",date:"September 03, 2016",update:"January 19, 2017"},{href:"http://codepen.io/angeal185/pen/KgwkPg",name:"KgwkPg",date:"September 05, 2016",update:"October 11, 2016"},{href:"http://codepen.io/angeal185/pen/GrXvrM",name:"star particle animated gradient canvas",date:"February 08, 2017",update:"February 08, 2017"},{href:"http://codepen.io/angeal185/pen/zKLVVB",name:"jquery overlay sliding svg navigation",date:"October 15, 2016",update:"October 15, 2016"},{href:"http://codepen.io/angeal185/pen/vKqkZO",name:"vKqkZO",date:"August 25, 2016",update:"October 11, 2016"},{href:"http://codepen.io/angeal185/pen/bZyjQL",name:"canvas animate",date:"August 23, 2016",update:"October 11, 2016"},{href:"http://codepen.io/angeal185/pen/XjVzxx",name:"bottom bar slider",date:"October 05, 2016",update:"October 11, 2016"},{href:"http://codepen.io/angeal185/pen/WGZGBg",name:"WGZGBg",date:"August 30, 2016",update:"October 11, 2016"},{href:"http://codepen.io/angeal185/pen/JKqNbv",name:"css flip cards",date:"August 22, 2016",update:"October 11, 2016"},{href:"http://codepen.io/angeal185/pen/GrvEZg",name:"animated canvas bubbles(css)",date:"January 25, 2017",update:"January 25, 2017"},{href:"http://codepen.io/angeal185/pen/PGRRwX",name:"custom scrollbar template",date:"October 10, 2016",update:"November 08, 2016"},{href:"http://codepen.io/angeal185/pen/ORyKoK",name:"ORyKoK",date:"September 12, 2016",update:"October 11, 2016"},{href:"http://codepen.io/angeal185/pen/yJWzmp",name:"yJWzmp",date:"August 22, 2016",update:"October 11, 2016"},{href:"http://codepen.io/angeal185/pen/WGdzLE",name:"jquery slide on hover footer",date:"October 05, 2016",update:"October 11, 2016"},{href:"http://codepen.io/angeal185/pen/ORBQGX",name:"JS word animation",date:"October 18, 2016",update:"October 18, 2016"},{href:"http://codepen.io/angeal185/pen/YWbkdv",name:"3d ... ish css flip animation",date:"August 22, 2016",update:"October 28, 2016"},{href:"http://codepen.io/angeal185/pen/GrXJOL",name:"calm animated particle background",date:"February 07, 2017",update:"February 19, 2017"},{href:"http://codepen.io/angeal185/pen/wovpMj",name:"Simple Email Validation",date:"November 04, 2016",update:"November 04, 2016"},{href:"http://codepen.io/angeal185/pen/qaOkPz",name:"canvas loader",date:"September 09, 2016",update:"October 11, 2016"},{href:"http://codepen.io/angeal185/pen/eBmRoQ",name:"canvas triangular particle animation",date:"November 06, 2016",update:"January 25, 2017"},{href:"http://codepen.io/angeal185/pen/dpKYKm",name:"responsive dummy image",date:"October 12, 2016",update:"November 03, 2016"},{href:"http://codepen.io/angeal185/pen/ZpgyOw",name:"Full screen jquery slide navigation",date:"November 01, 2016",update:"November 01, 2016"},{href:"http://codepen.io/angeal185/pen/YGOzPW",name:"css loader of hell",date:"October 15, 2016",update:"October 15, 2016"},{href:"http://codepen.io/angeal185/pen/LkoOaN",name:"bootstrap mobile iframe and Carousel preview",date:"August 23, 2016",update:"August 23, 2016"},{href:"http://codepen.io/angeal185/pen/GqbENp",name:"password protected",date:"August 25, 2016",update:"August 25, 2016"},{href:"http://codepen.io/angeal185/pen/yavqXr",name:"yavqXr",date:"October 07, 2016",update:"October 11, 2016"},{href:"http://codepen.io/angeal185/pen/rWgoJb",name:"animated hex canvas",date:"December 26, 2016",update:"December 26, 2016"},{href:"http://codepen.io/angeal185/pen/oBMKLY",name:"css background gradient animation",date:"February 07, 2017",update:"February 07, 2017"},{href:"http://codepen.io/angeal185/pen/bBNoQN",name:"flashing elements",date:"November 06, 2016",update:"November 07, 2016"},{href:"http://codepen.io/angeal185/pen/LRdBXJ",name:"webkit scrollbar simple",date:"October 10, 2016",update:"October 10, 2016"},{href:"http://codepen.io/angeal185/pen/GjXkdk",name:"Drag element",date:"October 16, 2016",update:"October 16, 2016"},{href:"http://codepen.io/angeal185/pen/BQyqRb",name:"jquery animated starfield",date:"November 07, 2016",update:"February 25, 2017"},{href:"http://codepen.io/angeal185/pen/ALzLNm",name:"css pagination",date:"October 26, 2016",update:"November 01, 2016"},{href:"http://codepen.io/angeal185/pen/yaxORj",name:"yaxORj",date:"October 16, 2016",update:"October 16, 2016"},{href:"http://codepen.io/angeal185/pen/rLgYZK",name:"animated css loaders",date:"August 22, 2016",update:"January 09, 2017"},{href:"http://codepen.io/angeal185/pen/pbmxGw",name:"pbmxGw",date:"August 23, 2016",update:"October 11, 2016"},{href:"http://codepen.io/angeal185/pen/pROvYo",name:"animated attract triangle canvas",date:"February 07, 2017",update:"February 07, 2017"},{href:"http://codepen.io/angeal185/pen/pROWzo",name:"animated fireworks canvas",date:"February 08, 2017",update:"February 08, 2017"},{href:"http://codepen.io/angeal185/pen/mOPpEg",name:"mOPpEg",date:"November 13, 2016",update:"November 13, 2016"},{href:"http://codepen.io/angeal185/pen/gLbGXq",name:"bubble",date:"November 06, 2016",update:"December 23, 2016"},{href:"http://codepen.io/angeal185/pen/dOPVMJ",name:"dOPVMJ",date:"November 06, 2016",update:"November 06, 2016"},{href:"http://codepen.io/angeal185/pen/ZBYqGG",name:"alert on resize function",date:"November 07, 2016",update:"November 07, 2016"},{href:"http://codepen.io/angeal185/pen/RoWbGj",name:"RoWbGj",date:"November 08, 2016",update:"November 08, 2016"},{href:"http://codepen.io/angeal185/pen/NRgVzv",name:"NRgVzv",date:"September 29, 2016",update:"September 29, 2016"},{href:"http://codepen.io/angeal185/pen/LbYWLx",name:"Javascript Calculator With Memory",date:"November 04, 2016",update:"November 04, 2016"},{href:"http://codepen.io/angeal185/pen/LbEzNz",name:"LbEzNz",date:"November 06, 2016",update:"November 06, 2016"},{href:"http://codepen.io/angeal185/pen/KrovAN",name:"escape and encode",date:"July 21, 2016",update:"October 16, 2016"},{href:"http://codepen.io/angeal185/pen/KrjqVv",name:"KrjqVv",date:"August 25, 2016",update:"August 25, 2016"},{href:"http://codepen.io/angeal185/pen/ALrzPo",name:"ALrzPo",date:"September 29, 2016",update:"September 29, 2016"}];
var wrap = ("<div id='wrapper'></div>"),
	canvas1 = ("<canvas id='canvas'></canvas>"),
	usr = ("<button class='btn btn-xs btn-rounded' type='button'><i class='online'></i> Online</button>"),
	headerRight = ("<li id='user-header'><a href='https://github.com/angeal185/' target = '_blank'><img id='imgi'>Admin</a></li>"),
	footer = ("<p class='sm-pull-reset shrink' style='margin:10px 80px'>2017 Ben eaves. All rights reserved.</p>"),
	svg1 = ("<div id='svg'></div>"),
	cdpLnk = ("<li class='cdpLnk'><a href='https://angeal185.github.io/dynamic-ajax-site-generator/' target = '_blank'>Codepen-Full</a></li>"),
	IP = "<code id='ip'></code>";

//init templates
$('body').prepend(wrap);
$('#wrapper').jsonRender(sidebarData,sidebar);
$('#wrapper').jsonRender(mainContentData,mainContent);
$('#menu').jsonRender(menuData,menu);
$('#headerRight').jsonRender(headerMainRightData,headerMain);

//snippets
$("body").prepend(canvas1),
$("#usr").prepend(usr),
$("#headerRight").append(headerRight),
$("li:has(#j-p)").after(cdpLnk),
$(".cdpLnk").eq(1).remove(),
$("#footer").prepend(footer),
$(".main-content").after(svg1),
$( "#svg" ).load( "app/views/svg.tpl" );
$("#footer").append(IP);

//globals
$("#wbs1,#cdpt,#lndt").addClass("ani fadeIn");
$("#imgh").attr({
        "src" : "app/images/avatars/github-512.png",
        "class" : "img-responsive img-circle"
    });
$("#user-header > a").attr({
        "data-tip" : "My github",
    });
$("#imgi").attr({
        "src" : "app/images/avatars/github.png",
        "class" : "img-responsive img-circle"
    });

$("#gth2").attr({
        "src" : "app/images/avatars/github.png",
        "class" : "toggle"
    });
$.get('https://ipinfo.io', function (res) {
        $('#ip').html( 'Your IP: ' +res.ip);
    },"jsonp");
$("#gth2").addClass("pull-left");

function placeCaretAtEnd(e){if(e.focus(),"undefined"!=typeof window.getSelection&&"undefined"!=typeof document.createRange){var t=document.createRange();t.selectNodeContents(e),t.collapse(!1);var n=window.getSelection();n.removeAllRanges(),n.addRange(t)}else if("undefined"!=typeof document.body.createTextRange){var o=document.body.createTextRange();o.moveToElementText(e),o.collapse(!1),o.select()}}(function(){var e,t,n,o,r,i,s,_,c,u,l,f,a,h,d,p,y,m,v,g,k,b,w={}.hasOwnProperty,q=[].indexOf||function(e){for(var t=0,n=this.length;n>t;t++)if(t in this&&this[t]===e)return t;return-1};c={is_unordered:!1,is_counting:!1,is_exclusive:!1,is_solitary:!1,prevent_default:!1,prevent_repeat:!1},k=["meta","alt","option","ctrl","shift","cmd"],v="ctrl",t={},t.debug=!1,e=function(){function e(e){var t,n;for(t in e)w.call(e,t)&&(n=e[t],n!==!1&&(this[t]=n));this.keys=this.keys||[],this.count=this.count||0}return e.prototype.allows_key_repeat=function(){return!this.prevent_repeat&&"function"==typeof this.on_keydown},e.prototype.reset=function(){return this.count=0,this.keyup_fired=null},e}(),t.Listener=function(){function t(e,t){var n,o,r;"undefined"!=typeof jQuery&&null!==jQuery&&e instanceof jQuery&&(1!==e.length&&m("Warning: your jQuery selector should have exactly one object."),e=e[0]),this.should_suppress_event_defaults=!1,this.should_force_event_defaults=!1,this.sequence_delay=800,this._registered_combos=[],this._keys_down=[],this._active_combos=[],this._sequence=[],this._sequence_timer=null,this._prevent_capture=!1,this._defaults=t||{};for(o in c)w.call(c,o)&&(r=c[o],this._defaults[o]=this._defaults[o]||r);this.element=e||document.body,n=function(e,t,n){return e.addEventListener?e.addEventListener(t,n):e.attachEvent&&e.attachEvent("on"+t,n),n},this.keydown_event=n(this.element,"keydown",function(e){return function(t){return t=t||window.event,e._receive_input(t,!0),e._bug_catcher(t)}}(this)),this.keyup_event=n(this.element,"keyup",function(e){return function(t){return t=t||window.event,e._receive_input(t,!1)}}(this)),this.blur_event=n(window,"blur",function(e){return function(){var t,n,o,r;for(r=e._keys_down,n=0,o=r.length;o>n;n++)t=r[n],e._key_up(t,{});return e._keys_down=[]}}(this))}return t.prototype.destroy=function(){var e;return e=function(e,t,n){return null!=e.removeEventListener?e.removeEventListener(t,n):null!=e.removeEvent?e.removeEvent("on"+t,n):void 0},e(this.element,"keydown",this.keydown_event),e(this.element,"keyup",this.keyup_event),e(window,"blur",this.blur_event)},t.prototype._bug_catcher=function(e){var t,n;return"cmd"===v&&q.call(this._keys_down,"cmd")>=0&&"cmd"!==(t=i(null!=(n=e.keyCode)?n:e.key))&&"shift"!==t&&"alt"!==t&&"caps"!==t&&"tab"!==t?this._receive_input(e,!1):void 0},t.prototype._cmd_bug_check=function(e){return"cmd"===v&&q.call(this._keys_down,"cmd")>=0&&q.call(e,"cmd")<0?!1:!0},t.prototype._prevent_default=function(e,t){return(t||this.should_suppress_event_defaults)&&!this.should_force_event_defaults&&(e.preventDefault?e.preventDefault():e.returnValue=!1,e.stopPropagation)?e.stopPropagation():void 0},t.prototype._get_active_combos=function(e){var t,n;return t=[],n=u(this._keys_down,function(t){return t!==e}),n.push(e),this._match_combo_arrays(n,function(e){return function(n){return e._cmd_bug_check(n.keys)?t.push(n):void 0}}(this)),this._fuzzy_match_combo_arrays(n,function(e){return function(n){return q.call(t,n)>=0?void 0:!n.is_solitary&&e._cmd_bug_check(n.keys)?t.push(n):void 0}}(this)),t},t.prototype._get_potential_combos=function(e){var t,n,o,r,i;for(n=[],i=this._registered_combos,o=0,r=i.length;r>o;o++)t=i[o],t.is_sequence||q.call(t.keys,e)>=0&&this._cmd_bug_check(t.keys)&&n.push(t);return n},t.prototype._add_to_active_combos=function(e){var t,n,o,r,i,s,_,c,u,l,f,a,h,d,p;if(c=!1,_=!0,r=!1,q.call(this._active_combos,e)>=0)return!0;if(this._active_combos.length)for(s=u=0,d=this._active_combos.length;d>=0?d>u:u>d;s=d>=0?++u:--u)if(t=this._active_combos[s],t&&t.is_exclusive&&e.is_exclusive){if(o=t.keys,!c)for(l=0,a=o.length;a>l;l++)if(n=o[l],c=!0,q.call(e.keys,n)<0){c=!1;break}if(_&&!c)for(p=e.keys,f=0,h=p.length;h>f;f++)if(i=p[f],_=!1,q.call(o,i)<0){_=!0;break}c&&(r?(t=this._active_combos.splice(s,1)[0],null!=t&&t.reset()):(t=this._active_combos.splice(s,1,e)[0],null!=t&&t.reset(),r=!0),_=!1)}return _&&this._active_combos.unshift(e),c||_},t.prototype._remove_from_active_combos=function(e){var t,n,o,r;for(n=o=0,r=this._active_combos.length;r>=0?r>o:o>r;n=r>=0?++o:--o)if(t=this._active_combos[n],t===e){e=this._active_combos.splice(n,1)[0],e.reset();break}},t.prototype._get_possible_sequences=function(){var e,t,n,o,r,i,s,_,c,l,f,a,h;for(r=[],f=this._registered_combos,s=0,l=f.length;l>s;s++)for(e=f[s],n=_=1,a=this._sequence.length;a>=1?a>=_:_>=a;n=a>=1?++_:--_)if(i=this._sequence.slice(-n),e.is_sequence&&(!(q.call(e.keys,"shift")<0)||(i=u(i,function(e){return"shift"!==e}),i.length))){for(t=c=0,h=i.length;h>=0?h>c:c>h;t=h>=0?++c:--c){if(e.keys[t]!==i[t]){o=!1;break}o=!0}o&&r.push(e)}return r},t.prototype._add_key_to_sequence=function(e,t){var n,o,r,i;if(this._sequence.push(e),o=this._get_possible_sequences(),o.length){for(r=0,i=o.length;i>r;r++)n=o[r],this._prevent_default(t,n.prevent_default);this._sequence_timer&&clearTimeout(this._sequence_timer),this.sequence_delay>-1&&(this._sequence_timer=setTimeout(function(){return this._sequence=[]},this.sequence_delay))}else this._sequence=[]},t.prototype._get_sequence=function(e){var t,n,o,r,i,s,_,c,l,f,a,h,d;for(a=this._registered_combos,_=0,f=a.length;f>_;_++)if(t=a[_],t.is_sequence){for(o=c=1,h=this._sequence.length;h>=1?h>=c:c>=h;o=h>=1?++c:--c)if(s=u(this._sequence,function(e){return q.call(t.keys,"shift")>=0?!0:"shift"!==e}).slice(-o),t.keys.length===s.length)for(n=l=0,d=s.length;d>=0?d>l:l>d;n=d>=0?++l:--l)if(i=s[n],!(q.call(t.keys,"shift")<0&&"shift"===i||"shift"===e&&q.call(t.keys,"shift")<0)){if(t.keys[n]!==i){r=!1;break}r=!0}if(r)return t.is_exclusive&&(this._sequence=[]),t}return!1},t.prototype._receive_input=function(e,t){var n,o;return this._prevent_capture?void(this._keys_down.length&&(this._keys_down=[])):(n=i(null!=(o=e.keyCode)?o:e.key),(t||this._keys_down.length||"alt"!==n&&n!==v)&&n?t?this._key_down(n,e):this._key_up(n,e):void 0)},t.prototype._fire=function(e,t,n,o){return"function"==typeof t["on_"+e]&&this._prevent_default(n,t["on_"+e].call(t["this"],n,t.count,o)!==!0),"release"===e&&(t.count=0),"keyup"===e?t.keyup_fired=!0:void 0},t.prototype._match_combo_arrays=function(e,t){var n,i,s,_;for(_=this._registered_combos,i=0,s=_.length;s>i;i++)n=_[i],(!n.is_unordered&&r(e,n.keys)||n.is_unordered&&o(e,n.keys))&&t(n)},t.prototype._fuzzy_match_combo_arrays=function(e,t){var n,o,r,i;for(i=this._registered_combos,o=0,r=i.length;r>o;o++)n=i[o],(!n.is_unordered&&a(n.keys,e)||n.is_unordered&&f(n.keys,e))&&t(n)},t.prototype._keys_remain=function(e){var t,n,o,r,i;for(i=e.keys,o=0,r=i.length;r>o;o++)if(t=i[o],q.call(this._keys_down,t)>=0){n=!0;break}return n},t.prototype._key_down=function(e,t){var n,o,r,i,_,c,u,l,f,a,h,d,p,y,m;f=s(e,t),f&&(e=f),this._add_key_to_sequence(e,t),l=this._get_sequence(e),l&&this._fire("keydown",l,t);for(_ in g)r=g[_],t[r]&&(_===e||q.call(this._keys_down,_)>=0||this._keys_down.push(_));for(_ in g)if(r=g[_],_!==e&&q.call(this._keys_down,_)>=0&&!t[r]){if("cmd"===_&&"cmd"!==v)continue;for(i=a=0,m=this._keys_down.length;m>=0?m>a:a>m;i=m>=0?++a:--a)this._keys_down[i]===_&&this._keys_down.splice(i,1)}for(o=this._get_active_combos(e),u=this._get_potential_combos(e),h=0,p=o.length;p>h;h++)n=o[h],this._handle_combo_down(n,u,e,t);if(u.length)for(d=0,y=u.length;y>d;d++)c=u[d],this._prevent_default(t,c.prevent_default);q.call(this._keys_down,e)<0&&this._keys_down.push(e)},t.prototype._handle_combo_down=function(e,t,n,o){var r,i,s,_,c,u;if(q.call(e.keys,n)<0)return!1;if(this._prevent_default(o,e&&e.prevent_default),r=!1,q.call(this._keys_down,n)>=0&&(r=!0,!e.allows_key_repeat()))return!1;if(_=this._add_to_active_combos(e,n),e.keyup_fired=!1,i=!1,e.is_exclusive)for(c=0,u=t.length;u>c;c++)if(s=t[c],s.is_exclusive&&s.keys.length>e.keys.length){i=!0;break}return!i&&(e.is_counting&&"function"==typeof e.on_keydown&&(e.count+=1),_)?this._fire("keydown",e,o,r):void 0},t.prototype._key_up=function(e,t){var n,o,r,i,_,c,u,l,f,a,h,d,p,m,v,g,k,b,w;if(l=e,u=s(e,t),u&&(e=u),u=y[l],t.shiftKey?u&&q.call(this._keys_down,u)>=0||(e=l):l&&q.call(this._keys_down,l)>=0||(e=u),c=this._get_sequence(e),c&&this._fire("keyup",c,t),q.call(this._keys_down,e)<0)return!1;for(_=f=0,g=this._keys_down.length;g>=0?g>f:f>g;_=g>=0?++f:--f)if((k=this._keys_down[_])===e||k===u||k===l){this._keys_down.splice(_,1);break}for(o=this._active_combos.length,i=[],b=this._active_combos,a=0,p=b.length;p>a;a++)n=b[a],q.call(n.keys,e)>=0&&i.push(n);for(h=0,m=i.length;m>h;h++)r=i[h],this._handle_combo_up(r,t,e);if(o>1)for(w=this._active_combos,d=0,v=w.length;v>d;d++)n=w[d],void 0===n||q.call(i,n)>=0||this._keys_remain(n)||this._remove_from_active_combos(n)},t.prototype._handle_combo_up=function(e,t,n){var r,i;this._prevent_default(t,e&&e.prevent_default),i=this._keys_remain(e),e.keyup_fired||(r=this._keys_down.slice(),r.push(n),(!e.is_solitary||o(r,e.keys))&&(this._fire("keyup",e,t),e.is_counting&&"function"==typeof e.on_keyup&&"function"!=typeof e.on_keydown&&(e.count+=1))),i||(this._fire("release",e,t),this._remove_from_active_combos(e))},t.prototype.simple_combo=function(e,t){return this.register_combo({keys:e,on_keydown:t})},t.prototype.counting_combo=function(e,t){return this.register_combo({keys:e,is_counting:!0,is_unordered:!1,on_keydown:t})},t.prototype.sequence_combo=function(e,t){return this.register_combo({keys:e,on_keydown:t,is_sequence:!0,is_exclusive:!0})},t.prototype.register_combo=function(t){var n,o,r,i;"string"==typeof t.keys&&(t.keys=t.keys.split(" ")),i=this._defaults;for(o in i)w.call(i,o)&&(r=i[o],void 0===t[o]&&(t[o]=r));return n=new e(t),b(n)?(this._registered_combos.push(n),n):void 0},t.prototype.register_many=function(e){var t,n,o,r;for(r=[],n=0,o=e.length;o>n;n++)t=e[n],r.push(this.register_combo(t));return r},t.prototype.unregister_combo=function(t){var n,i,s,_,c,u;if(!t)return!1;if(i=function(e){return function(t){var n,o,r,i;for(i=[],n=o=0,r=e._registered_combos.length;r>=0?r>o:o>r;n=r>=0?++o:--o){if(t===e._registered_combos[n]){e._registered_combos.splice(n,1);break}i.push(void 0)}return i}}(this),t instanceof e)return i(t);for("string"==typeof t&&(t=t.split(" ")),c=this._registered_combos,u=[],s=0,_=c.length;_>s;s++)n=c[s],null!=n&&(n.is_unordered&&o(t,n.keys)||!n.is_unordered&&r(t,n.keys)?u.push(i(n)):u.push(void 0));return u},t.prototype.unregister_many=function(e){var t,n,o,r;for(r=[],n=0,o=e.length;o>n;n++)t=e[n],r.push(this.unregister_combo(t));return r},t.prototype.get_registered_combos=function(){return this._registered_combos},t.prototype.reset=function(){return this._registered_combos=[]},t.prototype.listen=function(){return this._prevent_capture=!1},t.prototype.stop_listening=function(){return this._prevent_capture=!0},t.prototype.get_meta_key=function(){return v},t}(),_=function(){-1!==navigator.userAgent.indexOf("Mac OS X")&&(v="cmd")},n=function(){-1!==navigator.userAgent.indexOf("Opera")&&(p[17]="cmd")},i=function(e){return p[e]},u=function(e,t){var n;return e.filter?e.filter(t):function(){var o,r,i;for(i=[],o=0,r=e.length;r>o;o++)n=e[o],t(n)&&i.push(n);return i}()},o=function(e,t){var n,o,r;if(e.length!==t.length)return!1;for(o=0,r=e.length;r>o;o++)if(n=e[o],!(q.call(t,n)>=0))return!1;return!0},r=function(e,t){var n,o,r;if(e.length!==t.length)return!1;for(n=o=0,r=e.length;r>=0?r>o:o>r;n=r>=0?++o:--o)if(e[n]!==t[n])return!1;return!0},f=function(e,t){var n,o,r;for(o=0,r=e.length;r>o;o++)if(n=e[o],q.call(t,n)<0)return!1;return!0},l=Array.prototype.indexOf||function(e,t){var n,o,r;for(n=o=0,r=e.length;r>=0?r>=o:o>=r;n=r>=0?++o:--o)if(e[n]===t)return n;return-1},a=function(e,t){var n,o,r,i,s;for(r=0,i=0,s=e.length;s>i;i++){if(o=e[i],n=l.call(t,o),!(n>=r))return!1;r=n}return!0},m=function(){return t.debug?console.log.apply(console,arguments):void 0},h=function(e){var t,n,o;t=!1;for(o in p)if(n=p[o],e===n){t=!0;break}if(!t)for(o in y)if(n=y[o],e===n){t=!0;break}return t},b=function(e){var t,n,o,r,i,s,_,u,f,a,p,y,g,b,w;for(_=!0,e.keys.length||m("You're trying to bind a combo with no keys:",e),n=f=0,b=e.keys.length;b>=0?b>f:f>b;n=b>=0?++f:--f)o=e.keys[n],t=d[o],t&&(o=e.keys[n]=t),"meta"===o&&e.keys.splice(n,1,v),"cmd"===o&&m('Warning: use the "meta" key rather than "cmd" for Windows compatibility');for(w=e.keys,a=0,y=w.length;y>a;a++)o=w[a],h(o)||(m('Do not recognize the key "'+o+'"'),_=!1);if(q.call(e.keys,"meta")>=0||q.call(e.keys,"cmd")>=0){for(i=e.keys.slice(),p=0,g=k.length;g>p;p++)r=k[p],(n=l.call(i,r))>-1&&i.splice(n,1);i.length>1&&(m("META and CMD key combos cannot have more than 1 non-modifier keys",e,i),_=!1)}for(s in e)u=e[s],"undefined"===c[s]&&m("The property "+s+" is not a valid combo property. Your combo has still been registered.");return _},s=function(e,t){var n;return t.shiftKey?(n=y[e],null!=n?n:!1):!1},g={},d={escape:"esc",control:"ctrl",command:"cmd","break":"pause",windows:"cmd",option:"alt",caps_lock:"caps",apostrophe:"'",semicolon:";",tilde:"~",accent:"`",scroll_lock:"scroll",num_lock:"num"},y={"/":"?",".":">",",":"<","'":'"',";":":","[":"{","]":"}","\\":"|","`":"~","=":"+","-":"_",1:"!",2:"@",3:"#",4:"$",5:"%",6:"^",7:"&",8:"*",9:"(",0:")"},p={0:"\\",8:"backspace",9:"tab",12:"num",13:"enter",16:"shift",17:"ctrl",18:"alt",19:"pause",20:"caps",27:"esc",32:"space",33:"pageup",34:"pagedown",35:"end",36:"home",37:"left",38:"up",39:"right",40:"down",44:"print",45:"insert",46:"delete",48:"0",49:"1",50:"2",51:"3",52:"4",53:"5",54:"6",55:"7",56:"8",57:"9",65:"a",66:"b",67:"c",68:"d",69:"e",70:"f",71:"g",72:"h",73:"i",74:"j",75:"k",76:"l",77:"m",78:"n",79:"o",80:"p",81:"q",82:"r",83:"s",84:"t",85:"u",86:"v",87:"w",88:"x",89:"y",90:"z",91:"cmd",92:"cmd",93:"cmd",96:"num_0",97:"num_1",98:"num_2",99:"num_3",100:"num_4",101:"num_5",102:"num_6",103:"num_7",104:"num_8",105:"num_9",106:"num_multiply",107:"num_add",108:"num_enter",109:"num_subtract",110:"num_decimal",111:"num_divide",112:"f1",113:"f2",114:"f3",115:"f4",116:"f5",117:"f6",118:"f7",119:"f8",120:"f9",121:"f10",122:"f11",123:"f12",124:"print",144:"num",145:"scroll",186:";",187:"=",188:",",189:"-",190:".",191:"/",192:"`",219:"[",220:"\\",221:"]",222:"'",223:"`",224:"cmd",225:"alt",57392:"ctrl",63289:"num",59:";",61:"=",173:"-"},t._keycode_dictionary=p,t._is_array_in_array_sorted=a,_(),n(),"function"==typeof define&&define.amd?define([],function(){return t}):"undefined"!=typeof exports&&null!==exports?exports.keypress=t:window.keypress=t}).call(this),"undefined"!=typeof console&&("undefined"!=typeof console.log?console.olog=console.log:console.olog=function(){});var result=$("#console");console.log=function(e){console.olog(e),$("#console").append("<br />"+e+"<br />>&nbsp;"),result.focus(),placeCaretAtEnd(document.getElementById("console"))},console.error=console.debug=console.info=console.log;


var listener = new window.keypress.Listener();

listener.sequence_combo("i n f o enter", function() {
  console.log('<br>Info:<br><br>This site may be navigated either via mouse or command. Type your chosen command, hit enter<br>and the command will be carried out, regardless of the page you are viewing within this site.<br>Please take note that the kill website feature is only directly available via command.<br><br>2016 Ben Eaves.<br>');
});

listener.sequence_combo("h e l p enter", function() {
  console.log('<br><br>Available commands:<br><br>Type "skills" to navigate to my skills list.<br><br>Type "resume" to navigate to my resume.<br><br>Type "nodejs" to navigate to my nodejs portfolio.<br><br>Type "javascript" to navigate to my javascript portfolio.<br><br>Type "codepen" to navigate to my codepen portfolio.<br><br>Type "python" to navigate to my python portfolio.<br><br>Type "php" to navigate to my php portfolio.<br><br>Type "home" to navigate back to the dashboard.<br><br>Type "kill" to destroy this website.<br><br>');
});

listener.sequence_combo("p h p enter", function() {
  $('#pagecontainer').load('app/views//php-projects.tpl', function() {
		$('#pp01').jsonRender(phpProj,header),
		$('#pp01').jsonRender(phpProjects,template),
		$(document).prop('title', 'PHP:Projects'),
		toastr.success('PHP:Projects');
	});
});

listener.sequence_combo("h o m e enter", function() {
		$('#pagecontainer').load('app/views//index.tpl', function() {
		$('#dash').jsonRender(indexHeader,header),
		$(document).prop('title', 'Dashboard'),
		toastr.success('DASHBOARD');
		$("#pagecontainer").append(consl);
		});
	});

listener.sequence_combo("n o d e j s enter", function() {
		$('#pagecontainer').load('app/views//nodejs-projects.tpl', function() {
			$('#hp01').jsonRender(nodejsProj,header),
			$('#hp01').jsonRender(nodejsProjects,template),
			$(document).prop('title', 'NodeJS:Projects'),
			toastr.success('NodeJS:Projects');
		});
	});

listener.sequence_combo("j a v a s c r i p t enter", function() {
		$('#pagecontainer').load('app/views//javascript-projects.tpl', function() {
		$('#jp01').jsonRender(javascriptProj,header),
		$('#jp01').jsonRender(javascriptProjects,template),
		$(document).prop('title', 'JS:Projects'),
		toastr.success('JS:Projects');
		});
	});

listener.sequence_combo("c o d e p e n enter", function() {
		$('#pagecontainer').load('app/views//javascript-codepen.tpl', function() {
		$('#jt01').jsonRender(javascriptTemp,header),
		$('#jt01').jsonRender(codePenTplData,codePenTpl),
		$(document).prop('title', 'JS:Codepen'),
		$('.img-demo').css('width','300px'),
		$('#codePen').jsonRender(codePenData,codePen),
		toastr.success('JS:Codepen');
		});
	});
	
listener.sequence_combo("p y t h o n enter", function() {
		$('#pagecontainer').load('app/views//python-projects.tpl', function() {
		$('#pyp01').jsonRender(pythonProj,header),
		$('#pyp01').jsonRender(pythonProjects,template),
		$(document).prop('title', 'Python:Projects'),
		toastr.success('Python:Projects');
		});
	});


listener.sequence_combo("s k i l l s enter", function() {
		$('#pagecontainer').load('app/views//skills.tpl', function() {
		$('#skills01').jsonRender(skillsProj,header),
		$('#skills01').jsonRender(skillsTemplateData,skillsTemplate),
		$('#codeLeft').jsonRender(codeLeftData,skills),
		$('#codeRight').jsonRender(codeRightData,skills),
		$('#skillsLeft').jsonRender(skillsLeftData,skills),
		$('#skillsRight').jsonRender(skillsRightData,skills),
		$('#dbLeft').jsonRender(dbLeftData,skills),
		$('#dbRight').jsonRender(dbRightData,skills),
		$('#CMSLeft').jsonRender(CMSLeftData,skills),
		$('#CMSRight').jsonRender(CMSRightData,skills),
		$('#OSLeft').jsonRender(OSLeftData,skills),
		$('#OSRight').jsonRender(OSRightData,skills),
		$('#otherLeft').jsonRender(otherLeftData,apiSkills),
		$('#otherRight').jsonRender(otherRightData,apiSkills),
		$('#APILeft').jsonRender(APILeftData,apiSkills),
		$('#APIRight').jsonRender(APIRightData,apiSkills),
		$(document).prop('title', 'Profile:Skills'),
		toastr.success('Profile:Skills'),
		$.get("app/js/skills.js");
		
		});
	});

listener.sequence_combo("r e s u m e enter", function() {
		$('#pagecontainer').load('app/views//resume.tpl', function() {
		$('#resume01').jsonRender(resumeProj,header),
		$('#resume01').jsonRender(resumeData,resume),
		$('#work').jsonRender(workData,work),
		$('#edu').jsonRender(eduData,edu),
		$(document).prop('title', 'Profile:Resume'),
		toastr.success('Profile:Resume');
		});
	});
	
listener.sequence_combo("k i l l enter", function() {
	$('html').remove();
});

var consl = "<div id='console' contenteditable='true'><h1>Ben Eaves</h1><h2>Full-Stack web developer</h2><br>welcome to my world...<br><br>Type 'info' and hit enter for instructions.<br><br>Type 'help' and hit enter to see a full list of commands.<br>&nbsp;<br>>&nbsp;</div></div><div class='row' style='height:10vh'></div>";

$(function(){
		$('#pagecontainer').load('app/views/index.tpl', function() {
		$('#dash').jsonRender(indexHeader,header),
		$(document).prop('title', 'Dashboard'),
		toastr.success('LOADING...');
		$("#pagecontainer").append(consl);
		});
	});

$(function(){
	$('#indx').click(function(){
		$('#pagecontainer').load('app/views/index.tpl', function() {
		$('#dash').jsonRender(indexHeader,header),
		$(document).prop('title', 'Dashboard'),
		toastr.success('DASHBOARD');
		$("#pagecontainer").append(consl);
		$('html,body').animate({scrollTop:0},200);
		});
	});
});

$(function(){
	$('#h-p').click(function(){
		$('#pagecontainer').load('app/views/nodejs-projects.tpl', function() {
			$('#hp01').jsonRender(nodejsProj,header),
			$.getJSON("app/data/nodejs.json",function(p){
				$('#hp01').jsonRender(p.entries,template);
			}),	
			$(document).prop('title', 'NodeJS:Projects'),
			toastr.success('NodeJS:Projects');
			$('html,body').animate({scrollTop:0},200);
		});
	});
});

$(function(){
	$('#p-p').click(function(){
		$('#pagecontainer').load('app/views/php-projects.tpl', function() {
		$('#pp01').jsonRender(phpProj,header),
		$.getJSON("app/data/php.json",function(p){
			$('#pp01').jsonRender(p.entries,template);
		}),	
		$(document).prop('title', 'PHP:Projects'),
		toastr.success('PHP:Projects');
		$('html,body').animate({scrollTop:0},200);
		});
	});
});

$(function(){
	$('#j-p').click(function(){
		$('#pagecontainer').load('app/views/javascript-projects.tpl', function() {
		$('#jp01').jsonRender(javascriptProj,header),
		$.getJSON("app/data/javascript.json",function(p){
			$('#jp01').jsonRender(p.entries,template);
		}),	
		$(document).prop('title', 'JS:Projects'),
		toastr.success('JS:Projects');
		$('html,body').animate({scrollTop:0},200);
		});
	});
});

$(function(){
	$('#j-t').click(function(){
		$('#pagecontainer').load('app/views/javascript-codepen.tpl', function() {
		$('#jt01').jsonRender(javascriptTemp,header),
		$('#jt01').jsonRender(codePenTplData,codePenTpl),

		$(document).prop('title', 'JS:Codepen'),
		$('.img-demo').css('width','300px'),
		$('#codePen').jsonRender(codePenData,codePen),
		toastr.success('JS:Codepen');
		$('html,body').animate({scrollTop:0},200);
		});
	});
});

$(function(){
	$('#py-p').click(function(){
		$('#pagecontainer').load('app/views/python-projects.tpl', function() {
		$('#pyp01').jsonRender(pythonProj,header),
		$.getJSON("app/data/python.json",function(p){
			$('#pyp01').jsonRender(p.entries,template);
		}),
		$(document).prop('title', 'Python:Projects'),
		toastr.success('Python:Projects');
		$('html,body').animate({scrollTop:0},200);
		});
	});
});

$(function(){
	$('#c-s').click(function(){
		$('#pagecontainer').load('app/views/stylus-projects.tpl', function() {
		$('#sty01').jsonRender(stylusProj,header),
		$.getJSON("app/data/stylus.json",function(p){
			$('#sty01').jsonRender(p.entries,template);
		}),
		$(document).prop('title', 'Stylus:Projects'),
		toastr.success('Stylus:Projects');
		$('html,body').animate({scrollTop:0},200);
		});
	});
});

$(function(){
	$('#skills').click(function(){
		$('#pagecontainer').load('app/views/skills.tpl', function() {
		$('#skills01').jsonRender(skillsProj,header),
		$('#skills01').jsonRender(skillsTemplateData,skillsTemplate),
		$('#codeLeft').jsonRender(codeLeftData,skills),
		$('#codeRight').jsonRender(codeRightData,skills),
		$('#skillsLeft').jsonRender(skillsLeftData,skills),
		$('#skillsRight').jsonRender(skillsRightData,skills),
		$('#dbLeft').jsonRender(dbLeftData,skills),
		$('#dbRight').jsonRender(dbRightData,skills),
		$('#CMSLeft').jsonRender(CMSLeftData,skills),
		$('#CMSRight').jsonRender(CMSRightData,skills),
		$('#OSLeft').jsonRender(OSLeftData,skills),
		$('#OSRight').jsonRender(OSRightData,skills),
		$('#otherLeft').jsonRender(otherLeftData,apiSkills),
		$('#otherRight').jsonRender(otherRightData,apiSkills),
		$('#APILeft').jsonRender(APILeftData,apiSkills),
		$('#APIRight').jsonRender(APIRightData,apiSkills),
		$(document).prop('title', 'Profile:Skills'),
		toastr.success('Profile:Skills'),
		$.get("app/js/skills.js");
		$('html,body').animate({scrollTop:0},200);
		});
	});
});

$(function(){
	$('#resume').click(function(){
		$('#pagecontainer').load('app/views/resume.tpl', function() {
		$('#resume01').jsonRender(resumeProj,header),
		$('#resume01').jsonRender(resumeData,resume),
		$('#work').jsonRender(workData,work),
		$('#edu').jsonRender(eduData,edu),
		$(document).prop('title', 'Profile:Resume'),
		toastr.success('Profile:Resume');
		$('html,body').animate({scrollTop:0},200);
		});
	});
});

(function() {
	var t, e, n, i = function(t, e) {
			return function() {
				return t.apply(e, arguments)
			}
		},
		o = [].indexOf || function(t) {
			for(var e = 0, n = this.length; n > e; e++)
				if(e in this && this[e] === t) return e;
			return -1
		};
	e = function() {
		function t() {}
		return t.prototype.extend = function(t, e) {
			var n, i;
			for(n in e) i = e[n], null == t[n] && (t[n] = i);
			return t
		}, t.prototype.isMobile = function(t) {
			return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(t)
		}, t
	}(), n = this.WeakMap || this.MozWeakMap || (n = function() {
		function t() {
			this.keys = [], this.values = []
		}
		return t.prototype.get = function(t) {
			var e, n, i, o, r;
			for(r = this.keys, e = i = 0, o = r.length; o > i; e = ++i)
				if(n = r[e], n === t) return this.values[e]
		}, t.prototype.set = function(t, e) {
			var n, i, o, r, s;
			for(s = this.keys, n = o = 0, r = s.length; r > o; n = ++o)
				if(i = s[n], i === t) return void(this.values[n] = e);
			return this.keys.push(t), this.values.push(e)
		}, t
	}()), t = this.MutationObserver || this.WebkitMutationObserver || this.MozMutationObserver || (t = function() {
		function t() {
			console.warn("MutationObserver is not supported by your browser."), console.warn("ANI.js cannot detect dom mutations, please call .sync() after loading new content.")
		}
		return t.notSupported = !0, t.prototype.observe = function() {}, t
	}()), this.ANI = function() {
		function r(t) {
			null == t && (t = {}), this.scrollCallback = i(this.scrollCallback, this), this.scrollHandler = i(this.scrollHandler, this), this.start = i(this.start, this), this.scrolled = !0, this.config = this.util().extend(t, this.defaults), this.animationNameCache = new n
		}
		return r.prototype.defaults = {
			boxClass: "ani",
			animateClass: "animated",
			offset: 0,
			mobile: !1,
			live: !0
		}, r.prototype.init = function() {
			var t;
			return this.element = window.document.documentElement, "interactive" === (t = document.readyState) || "complete" === t ? this.start() : document.addEventListener("DOMContentLoaded", this.start), this.finished = []
		}, r.prototype.start = function() {
			var e, n, i, o;
			if(this.stopped = !1, this.boxes = function() {
					var t, n, i, o;
					for(i = this.element.querySelectorAll("." + this.config.boxClass), o = [], t = 0, n = i.length; n > t; t++) e = i[t], o.push(e);
					return o
				}.call(this), this.all = function() {
					var t, n, i, o;
					for(i = this.boxes, o = [], t = 0, n = i.length; n > t; t++) e = i[t], o.push(e);
					return o
				}.call(this), this.boxes.length)
				if(this.disabled()) this.resetStyle();
				else {
					for(o = this.boxes, n = 0, i = o.length; i > n; n++) e = o[n], this.applyStyle(e, !0);
					window.addEventListener("scroll", this.scrollHandler, !1), window.addEventListener("resize", this.scrollHandler, !1), this.interval = setInterval(this.scrollCallback, 50)
				}
			return this.config.live ? new t(function(t) {
				return function(e) {
					var n, i, o, r, s;
					for(s = [], o = 0, r = e.length; r > o; o++) i = e[o], s.push(function() {
						var t, e, o, r;
						for(o = i.addedNodes || [], r = [], t = 0, e = o.length; e > t; t++) n = o[t], r.push(this.doSync(n));
						return r
					}.call(t));
					return s
				}
			}(this)).observe(document.body, {
				childList: !0,
				subtree: !0
			}) : void 0
		}, r.prototype.stop = function() {
			return this.stopped = !0, window.removeEventListener("scroll", this.scrollHandler, !1), window.removeEventListener("resize", this.scrollHandler, !1), null != this.interval ? clearInterval(this.interval) : void 0
		}, r.prototype.sync = function(e) {
			return t.notSupported ? this.doSync(this.element) : void 0
		}, r.prototype.doSync = function(t) {
			var e, n, i, r, s;
			if(!this.stopped) {
				if(null == t && (t = this.element), 1 !== t.nodeType) return;
				for(t = t.parentNode || t, r = t.querySelectorAll("." + this.config.boxClass), s = [], n = 0, i = r.length; i > n; n++) e = r[n], o.call(this.all, e) < 0 ? (this.applyStyle(e, !0), this.boxes.push(e), this.all.push(e), s.push(this.scrolled = !0)) : s.push(void 0);
				return s
			}
		}, r.prototype.show = function(t) {
			return this.applyStyle(t), t.className = "" + t.className + " " + this.config.animateClass
		}, r.prototype.applyStyle = function(t, e) {
			var n, i, o;
			return i = t.getAttribute("data-ani-duration"), n = t.getAttribute("data-ani-delay"), o = t.getAttribute("data-ani-iteration"), this.animate(function(r) {
				return function() {
					return r.customStyle(t, e, i, n, o)
				}
			}(this))
		}, r.prototype.animate = function() {
			return "requestAnimationFrame" in window ? function(t) {
				return window.requestAnimationFrame(t)
			} : function(t) {
				return t()
			}
		}(), r.prototype.resetStyle = function() {
			var t, e, n, i, o;
			for(i = this.boxes, o = [], e = 0, n = i.length; n > e; e++) t = i[e], o.push(t.setAttribute("style", "visibility: visible;"));
			return o
		}, r.prototype.customStyle = function(t, e, n, i, o) {
			return e && this.cacheAnimationName(t), t.style.visibility = e ? "hidden" : "visible", n && this.vendorSet(t.style, {
				animationDuration: n
			}), i && this.vendorSet(t.style, {
				animationDelay: i
			}), o && this.vendorSet(t.style, {
				animationIterationCount: o
			}), this.vendorSet(t.style, {
				animationName: e ? "none" : this.cachedAnimationName(t)
			}), t
		}, r.prototype.vendors = ["moz", "webkit"], r.prototype.vendorSet = function(t, e) {
			var n, i, o, r;
			r = [];
			for(n in e) i = e[n], t["" + n] = i, r.push(function() {
				var e, r, s, a;
				for(s = this.vendors, a = [], e = 0, r = s.length; r > e; e++) o = s[e], a.push(t["" + o + n.charAt(0).toUpperCase() + n.substr(1)] = i);
				return a
			}.call(this));
			return r
		}, r.prototype.vendorCSS = function(t, e) {
			var n, i, o, r, s, a;
			for(i = window.getComputedStyle(t), n = i.getPropertyCSSValue(e), a = this.vendors, r = 0, s = a.length; s > r; r++) o = a[r], n = n || i.getPropertyCSSValue("-" + o + "-" + e);
			return n
		}, r.prototype.animationName = function(t) {
			var e;
			try {
				e = this.vendorCSS(t, "animation-name").cssText
			} catch(n) {
				e = window.getComputedStyle(t).getPropertyValue("animation-name")
			}
			return "none" === e ? "" : e
		}, r.prototype.cacheAnimationName = function(t) {
			return this.animationNameCache.set(t, this.animationName(t))
		}, r.prototype.cachedAnimationName = function(t) {
			return this.animationNameCache.get(t)
		}, r.prototype.scrollHandler = function() {
			return this.scrolled = !0
		}, r.prototype.scrollCallback = function() {
			var t;
			return !this.scrolled || (this.scrolled = !1, this.boxes = function() {
				var e, n, i, o;
				for(i = this.boxes, o = [], e = 0, n = i.length; n > e; e++) t = i[e], t && (this.isVisible(t) ? this.show(t) : o.push(t));
				return o
			}.call(this), this.boxes.length || this.config.live) ? void 0 : this.stop()
		}, r.prototype.offsetTop = function(t) {
			for(var e; void 0 === t.offsetTop;) t = t.parentNode;
			for(e = t.offsetTop; t = t.offsetParent;) e += t.offsetTop;
			return e
		}, r.prototype.isVisible = function(t) {
			var e, n, i, o, r;
			return n = t.getAttribute("data-ani-offset") || this.config.offset, r = window.pageYOffset, o = r + Math.min(this.element.clientHeight, innerHeight) - n, i = this.offsetTop(t), e = i + t.clientHeight, o >= i && e >= r
		}, r.prototype.util = function() {
			return null != this._util ? this._util : this._util = new e
		}, r.prototype.disabled = function() {
			return !this.config.mobile && this.util().isMobile(navigator.userAgent)
		}, r
	}()
}).call(this);

!function(e){e(["jquery"],function(e){return function(){function t(e,t,n){return m({type:b.error,iconClass:g().iconClasses.error,message:e,optionsOverride:n,title:t})}function n(t,n){return t||(t=g()),v=e("#"+t.containerId),v.length?v:(n&&(v=u(t)),v)}function o(e,t,n){return m({type:b.info,iconClass:g().iconClasses.info,message:e,optionsOverride:n,title:t})}function i(e){C=e}function s(e,t,n){return m({type:b.success,iconClass:g().iconClasses.success,message:e,optionsOverride:n,title:t})}function a(e,t,n){return m({type:b.warning,iconClass:g().iconClasses.warning,message:e,optionsOverride:n,title:t})}function r(e,t){var o=g();v||n(o),d(e,o,t)||l(o)}function c(t){var o=g();return v||n(o),t&&0===e(":focus",t).length?void h(t):void(v.children().length&&v.remove())}function l(t){for(var n=v.children(),o=n.length-1;o>=0;o--)d(e(n[o]),t)}function d(t,n,o){var i=o&&o.force?o.force:!1;return t&&(i||0===e(":focus",t).length)?(t[n.hideMethod]({duration:n.hideDuration,easing:n.hideEasing,complete:function(){h(t)}}),!0):!1}function u(t){return v=e("<div/>").attr("id",t.containerId).addClass(t.positionClass),v.appendTo(e(t.target)),v}function p(){return{tapToDismiss:!0,toastClass:"toast",containerId:"toast-container",debug:!1,showMethod:"fadeIn",showDuration:300,showEasing:"swing",onShown:void 0,hideMethod:"fadeOut",hideDuration:1e3,hideEasing:"swing",onHidden:void 0,closeMethod:!1,closeDuration:!1,closeEasing:!1,closeOnHover:!0,extendedTimeOut:1e3,iconClasses:{error:"toast-error",info:"toast-info",success:"black",warning:"toast-warning"},iconClass:"",positionClass:"toast-bottom-right",timeOut:3e3,titleClass:"toast-title",messageClass:"toast-message",escapeHtml:!1,target:"body",closeHtml:'<button type="button">&times;</button>',closeClass:"toast-close-button",newestOnTop:!0,preventDuplicates:!1,progressBar:!1,progressClass:"toast-progress",rtl:!1}}function f(e){C&&C(e)}function m(t){function o(e){return null==e&&(e=""),e.replace(/&/g,"&amp;").replace(/"/g,"&quot;").replace(/'/g,"&#39;").replace(/</g,"&lt;").replace(/>/g,"&gt;")}function i(){c(),d(),u(),p(),m(),C(),l(),s()}function s(){var e="";switch(t.iconClass){case"toast-success":case"toast-info":e="polite";break;default:e="assertive"}I.attr("aria-live",e)}function a(){y.closeOnHover&&I.hover(H,D),!y.onclick&&y.tapToDismiss&&I.click(O),y.closeButton&&j&&j.click(function(e){e.stopPropagation?e.stopPropagation():void 0!==e.cancelBubble&&e.cancelBubble!==!0&&(e.cancelBubble=!0),y.onCloseClick&&y.onCloseClick(e),O(!0)}),y.onclick&&I.click(function(e){y.onclick(e),O()})}function r(){I.hide(),I[y.showMethod]({duration:y.showDuration,easing:y.showEasing,complete:y.onShown}),y.timeOut>0&&(k=setTimeout(O,y.timeOut),$.maxHideTime=parseFloat(y.timeOut),$.hideEta=(new Date).getTime()+$.maxHideTime,y.progressBar&&($.intervalId=setInterval(x,10)))}function c(){t.iconClass&&I.addClass(y.toastClass).addClass(E)}function l(){y.newestOnTop?v.prepend(I):v.append(I)}function d(){if(t.title){var e=t.title;y.escapeHtml&&(e=o(t.title)),M.append(e).addClass(y.titleClass),I.append(M)}}function u(){if(t.message){var e=t.message;y.escapeHtml&&(e=o(t.message)),B.append(e).addClass(y.messageClass),I.append(B)}}function p(){y.closeButton&&(j.addClass(y.closeClass).attr("role","button"),I.prepend(j))}function m(){y.progressBar&&(q.addClass(y.progressClass),I.prepend(q))}function C(){y.rtl&&I.addClass("rtl")}function b(e,t){if(e.preventDuplicates){if(t.message===w)return!0;w=t.message}return!1}function O(t){var n=t&&y.closeMethod!==!1?y.closeMethod:y.hideMethod,o=t&&y.closeDuration!==!1?y.closeDuration:y.hideDuration,i=t&&y.closeEasing!==!1?y.closeEasing:y.hideEasing;return!e(":focus",I).length||t?(clearTimeout($.intervalId),I[n]({duration:o,easing:i,complete:function(){h(I),clearTimeout(k),y.onHidden&&"hidden"!==F.state&&y.onHidden(),F.state="hidden",F.endTime=new Date,f(F)}})):void 0}function D(){(y.timeOut>0||y.extendedTimeOut>0)&&(k=setTimeout(O,y.extendedTimeOut),$.maxHideTime=parseFloat(y.extendedTimeOut),$.hideEta=(new Date).getTime()+$.maxHideTime)}function H(){clearTimeout(k),$.hideEta=0,I.stop(!0,!0)[y.showMethod]({duration:y.showDuration,easing:y.showEasing})}function x(){var e=($.hideEta-(new Date).getTime())/$.maxHideTime*100;q.width(e+"%")}var y=g(),E=t.iconClass||y.iconClass;if("undefined"!=typeof t.optionsOverride&&(y=e.extend(y,t.optionsOverride),E=t.optionsOverride.iconClass||E),!b(y,t)){T++,v=n(y,!0);var k=null,I=e("<div/>"),M=e("<div/>"),B=e("<div/>"),q=e("<div/>"),j=e(y.closeHtml),$={intervalId:null,hideEta:null,maxHideTime:null},F={toastId:T,state:"visible",startTime:new Date,options:y,map:t};return i(),r(),a(),f(F),y.debug&&console&&console.log(F),I}}function g(){return e.extend({},p(),O.options)}function h(e){v||(v=n()),e.is(":visible")||(e.remove(),e=null,0===v.children().length&&(v.remove(),w=void 0))}var v,C,w,T=0,b={error:"error",info:"info",success:"success",warning:"warning"},O={clear:r,remove:c,error:t,getContainer:n,info:o,options:{},subscribe:i,success:s,version:"2.1.3",warning:a};return O}()})}("function"==typeof define&&define.amd?define:function(e,t){"undefined"!=typeof module&&module.exports?module.exports=t(require("jquery")):window.toastr=t(window.jQuery)}),$(function(){$(".bar").each(function(){var e=$(this),t=e.find(".pct"),n=e.data("bar");setTimeout(function(){e.css("background-color","red").animate({width:t.html()},n.speed||3e3,function(){t.css({color:"red",opacity:1})})},n.delay||0)})});
function collapsedSidebar() {
    "relative" != $body.css("position") ? $body.hasClass("sidebar-collapsed") ? removeCollapsedSidebar() : createCollapsedSidebar() : $body.hasClass("sidebar-show") ? $body.removeClass("sidebar-show") : $body.addClass("sidebar-show");
}

function createCollapsedSidebar() {
    $body.addClass("sidebar-collapsed"), $(".nav-sidebar ul").attr("style", ""), $(this).addClass("menu-collapsed"), $("#switch-sidebar").prop("checked");
}

function removeCollapsedSidebar() {
    $body.removeClass("sidebar-collapsed"), $body.hasClass("submenu-hover") || $(".nav-sidebar li.active ul").css({
        display: "block"
    }), $(this).removeClass("menu-collapsed"), $body.hasClass("sidebar-light") && !$body.hasClass("sidebar-fixed") && $(".sidebar").height("");
}

function toggleFullScreen() {
    doc.fullscreenElement || doc.msFullscreenElement || doc.webkitIsFullScreen || doc.mozFullScreenElement ? doc.exitFullscreen ? doc.exitFullscreen() : doc.webkitExitFullscreen ? doc.webkitExitFullscreen() : doc.webkitCancelFullScreen ? doc.webkitCancelFullScreen() : doc.msExitFullscreen ? doc.msExitFullscreen() : doc.mozCancelFullScreen && doc.mozCancelFullScreen() : docEl.requestFullscreen ? docEl.requestFullscreen() : docEl.webkitRequestFullScreen ? docEl.webkitRequestFullscreen() : docEl.webkitRequestFullScreen ? docEl.webkitRequestFullScreen() : docEl.msRequestFullscreen ? docEl.msRequestFullscreen() : docEl.mozRequestFullScreen && docEl.mozRequestFullScreen();
}

function handleSidebarHide() {
    hiddenElements = $(":hidden"), visibleElements = $(":visible"), $(".menu-settings").on("click", "#hide-top-sidebar", function(e) {
        e.preventDefault();
        var t = $(this).text();
        $(".sidebar .sidebar-top").slideToggle(300), "Hide user & search" == t && $(this).text("Show user & search");
    }), $(".topbar").on("click", ".toggle-sidebar-top", function(e) {
        e.preventDefault(), $(".sidebar .sidebar-top").slideToggle(300), $(".toggle-sidebar-top span").hasClass("icon-user-following") ? $(".toggle-sidebar-top span").removeClass("icon-user-following").addClass("icon-user-unfollow") : $(".toggle-sidebar-top span").removeClass("icon-user-unfollow").addClass("icon-user-following");
    });
}

function toggleSidebarMenu() {
    $("body").hasClass("sidebar-collapsed") || $("body").hasClass("sidebar-top") || $("body").hasClass("submenu-hover") ? $(".nav-sidebar .children").css({
        display: ""
    }) : $(".nav-active.active .children").css("display", "block"), $(".sidebar").on("click", ".nav-sidebar li.nav-parent > a", function(e) {
        if (e.preventDefault(), (!$("body").hasClass("sidebar-collapsed") || $("body").hasClass("sidebar-hover")) && !$("body").hasClass("submenu-hover")) {
            var t = $(this).parent().parent();
            t.children("li.active").children(".children").slideUp(200), $(".nav-sidebar .arrow").removeClass("active"), t.children("li.active").removeClass("active");
            var s = $(this).next();
            s.is(":visible") ? (s.children().addClass("hidden-item"), $(this).parent().removeClass("active"), s.slideUp(200, function() {
                s.children().removeClass("hidden-item");
            })) : ($(this).find(".arrow").addClass("active"), s.children().addClass("is-hidden"), setTimeout(function() {
                s.children().addClass("is-shown");
            }, 0), s.slideDown(200, function() {
                $(this).parent().addClass("active"), setTimeout(function() {
                    s.children().removeClass("is-hidden").removeClass("is-shown");
                }, 500);
            }));
        }
    });
}

function sidebarBehaviour() {
    windowWidth = $(window).width(), windowHeight = $(window).height() - $(".topbar").height(), sidebarMenuHeight = $(".nav-sidebar").height(), windowWidth < 1024 && $("body").removeClass("sidebar-collapsed"), $("body").hasClass("sidebar-collapsed") && sidebarMenuHeight > windowHeight && ($("body").removeClass("fixed-sidebar"));
}

function scrollTop() {
    $(window).scroll(function() {
        $(this).scrollTop() > 100 ? $(".scrollup").fadeIn() : $(".scrollup").fadeOut();
    }), $(".scrollup").click(function() {
        return $("html, body").animate({
            scrollTop: 0
        }, 1e3), !1;
    });
}

function detectIE() {
    var e = window.navigator.userAgent,
        t = e.indexOf("MSIE "),
        s = e.indexOf("Trident/"),
        i = e.indexOf("Edge/");
    (t > 0 || s > 0 || i > 0) && $("html").addClass("ie-browser");
}

function line() {
    this.path = [], this.speed = rand(10, 20), this.count = randInt(10, 30), this.x = width / 2, this.y = height / 2 + 1, this.target = {
        x: width / 2,
        y: height / 2
    }, this.dist = 0, this.angle = 0, this.hue = tick / 5, this.life = 1, this.updateAngle(), this.updateDist();
}

function rand(e, t) {
    return Math.random() * (t - e) + e;
}

function randInt(e, t) {
    return Math.floor(e + Math.random() * (t - e + 1));
}

function init() {
    canvas = document.getElementById("canvas"), ctx = canvas.getContext("2d"), size = 30, lines = [], reset(), loop();
}

function reset() {
    width = 2 * Math.ceil(window.innerWidth / 2), height = 2 * Math.ceil(window.innerHeight / 2), tick = 0, lines.length = 0, canvas.width = width, canvas.height = height;
}

function create() {
    tick % 10 === 0 && lines.push(new line());
}

function step() {
    for (var e = lines.length; e--;) lines[e].step(e);
}

function clear() {
    ctx.globalCompositeOperation = "destination-out", ctx.fillStyle = "hsla(0, 0%, 0%, 0.1", ctx.fillRect(0, 0, width, height), ctx.globalCompositeOperation = "lighter";
}

function draw() {
    ctx.save(), ctx.translate(width / 2, height / 2), ctx.rotate(.001 * tick);
    var e = .8 + .2 * Math.cos(.02 * tick);
    ctx.scale(e, e), ctx.translate(-width / 2, -height / 2);
    for (var t = lines.length; t--;) lines[t].draw(t);
    ctx.restore();
}

function loop() {
    requestAnimationFrame(loop), create(), step(), clear(), draw(), tick++;
}

function onresize() {
    reset();
}
var doc = document,
    docEl = document.documentElement,
    $body = $("body"),
    $sidebar = $(".sidebar"),
    content = document.querySelector(".page-content"),
    $loader = $("#preloader"),
    docHeight = $(document).height(),
    windowHeight = $(window).height(),
    start = delta = end = 0;

$(window).load(function() {
    setTimeout(function() {
        $(".loader-overlay").addClass("loaded"), $("body > section").animate({
            opacity: 1
        }, 400);
    }, 500);
}), $("[data-toggle]").on("click", function(e) {
    e.preventDefault();
    var t = $(this).data("toggle");
    "sidebar-behaviour" == t && toggleSidebar(), "submenu" == t && toggleSubmenuHover(), "sidebar-collapsed" == t && collapsedSidebar(), "sidebar-top" == t && toggleSidebarTop(), "sidebar-hover" == t && toggleSidebarHover();
}), $(".toggle_fullscreen").click(function() {
    toggleFullScreen();
});
var hoverTimeout;
$(".nav-sidebar > li").hover(function() {
    clearTimeout(hoverTimeout), $(this).siblings().removeClass("nav-hover"), $(this).addClass("nav-hover");
}, function() {
    var e = $(this);
    hoverTimeout = setTimeout(function() {
        e.removeClass("nav-hover");
    }, 200);
}), $(".nav-sidebar > li .children").hover(function() {
    clearTimeout(hoverTimeout), $(this).closest(".nav-parent").siblings().removeClass("nav-hover"), $(this).closest(".nav-parent").addClass("nav-hover");
}, function() {
    $(this), hoverTimeout = setTimeout(function() {
        $(this).closest(".nav-parent").removeClass("nav-hover");
    }, 200);
}), $("body").hasClass("sidebar-collapsed") && $(".nav-sidebar .children").css({
    display: ""
}), $(document).ready(function() {
    toggleSidebarMenu(), handleSidebarHide(), scrollTop(), sidebarBehaviour(), detectIE(), $("body").hasClass("sidebar-hover") && sidebarHover();
});

var toolTips = {

  timeout: null,
  html: '<div id="tooltip"></div>',

  init: function(){
    $(toolTips.html).appendTo('body');
    $('[data-tip]').on('mouseenter', toolTips.show);        $('[data-tip]').on('mouseleave', toolTips.hide);
  },

  show: function(){
    $('#tooltip').css({opacity:0});
    clearTimeout(toolTips.timeout);
    $('#tooltip').html($(this).data('tip'));

    var offset = $(this).offset(),
        height = $(this).outerHeight()+15,
        parWidth = $(this).outerWidth()/2,
        width  = (($('#tooltip').outerWidth())/2)-parWidth;

    $('#tooltip').css({top:offset.top+height, left:offset.left-width, opacity:1});
  },

  hide: function(){
    toolTips.timeout = setTimeout(function(){
      $('#tooltip').css({opacity:0});
    }, 50);
  }

};

toolTips.init();

$(window).load(function() {
$("#wrapper").css('display','inherit'),
new ANI().init(),
$("#loader").delay( 3000 ).fadeOut( 1500 ),
toastr.success('DASHBOARD');
});

function line(){this.path=[],this.speed=rand(10,20),this.count=randInt(10,30),this.x=width/2,1,this.y=height/2+1,this.target={x:width/2,y:height/2},this.dist=0,this.angle=0,this.hue=tick/5,this.life=1,this.updateAngle(),this.updateDist()}function rand(t,i){return Math.random()*(i-t)+t}function randInt(t,i){return Math.floor(t+Math.random()*(i-t+1))}function init(){canvas=document.getElementById("canvas"),ctx=canvas.getContext("2d"),size=30,lines=[],reset(),loop()}function reset(){width=2*Math.ceil(window.innerWidth/2),height=2*Math.ceil(window.innerHeight/2),tick=0,lines.length=0,canvas.width=width,canvas.height=height}function create(){tick%10===0&&lines.push(new line)}function step(){for(var t=lines.length;t--;)lines[t].step(t)}function clear(){ctx.globalCompositeOperation="destination-out",ctx.fillStyle="hsla(0, 0%, 0%, 0.1",ctx.fillRect(0,0,width,height),ctx.globalCompositeOperation="lighter"}function draw(){ctx.save(),ctx.translate(width/2,height/2),ctx.rotate(.001*tick);var t=.8+.2*Math.cos(.02*tick);ctx.scale(t,t),ctx.translate(-width/2,-height/2);for(var i=lines.length;i--;)lines[i].draw(i);ctx.restore()}function loop(){requestAnimationFrame(loop),create(),step(),clear(),draw(),tick++}function onresize(){reset()}var canvas,ctx,width,height,size,lines,tick;line.prototype.step=function(t){this.x+=Math.cos(this.angle)*this.speed,this.y+=Math.sin(this.angle)*this.speed,this.updateDist(),this.dist<this.speed&&(this.x=this.target.x,this.y=this.target.y,this.changeTarget()),this.path.push({x:this.x,y:this.y}),this.path.length>this.count&&this.path.shift(),this.life-=.001,this.life<=0&&(this.path=null,lines.splice(t,1))},line.prototype.updateDist=function(){var t=this.target.x-this.x,i=this.target.y-this.y;this.dist=Math.sqrt(t*t+i*i)},line.prototype.updateAngle=function(){var t=this.target.x-this.x,i=this.target.y-this.y;this.angle=Math.atan2(i,t)},line.prototype.changeTarget=function(){var t=randInt(0,3);switch(t){case 0:this.target.y=this.y-size;break;case 1:this.target.x=this.x+size;break;case 2:this.target.y=this.y+size;break;case 3:this.target.x=this.x-size}this.updateAngle()},line.prototype.draw=function(t){ctx.beginPath();for(var i=rand(0,10),e=0,s=this.path.length;s>e;e++)ctx[0===e?"moveTo":"lineTo"](this.path[e].x+rand(-i,i),this.path[e].y+rand(-i,i));ctx.strokeStyle="hsla("+rand(this.hue,this.hue+30)+", 80%, 55%, "+this.life/3+")",ctx.lineWidth=rand(.1,2),ctx.stroke()},window.addEventListener("resize",onresize),init();
$(window).load(function(){$(function(e){e.preload=function(t,n,o){var i=[],s=function(e){for(var t=0;t<i.length;t++)if(i[t].src===e.src)return i[t];return i.push(e),e},r=function(e,t,n){"function"==typeof t&&t.call(e,n)};return function(t,n,o){if(void 0!==t){"string"==typeof t&&(t=[t]),2===arguments.length&&"function"==typeof n&&(o=n,n=0);var i,l=t.length;if(n>0&&l>n&&(i=t.slice(n,l),t=t.slice(0,n),l=t.length),!l)return void r(t,o,!0);for(var a,c=arguments.callee,d=0,u=function(){++d===l&&(r(t,o,!i),c(i,n,o))},p=0;p<t.length;p++)a=new Image,a.src=t[p],(a=s(a)).complete?u():e(a).on("load error",u)}}}();var t=function(t,n){var o,i,s,r,l,a=[],c=RegExp("url\\(['\"]?([^\"')]*)['\"]?\\)","i");return n.recursive&&(t=t.find("*").add(t)),t.each(function(){for(o=e(this),i=o.css("background-image")+","+o.css("border-image-source"),i=i.split(","),l=0;l<i.length;l++)-1===(s=i[l]).indexOf("about:blank")&&-1===s.indexOf("data:image")&&(r=c.exec(s))&&a.push(r[1]);"IMG"===this.nodeName&&a.push(this.src)}),a};e.fn.preload=function(){var n,o;1===arguments.length?"object"==typeof arguments[0]?n=arguments[0]:o=arguments[0]:arguments.length>1&&(n=arguments[0],o=arguments[1]),n=e.extend({recursive:!0,part:0},n);var i=this,s=t(i,n);return e.preload(s,n.part,function(e){e&&"function"==typeof o&&o.call(i.get())}),this}}),$(function(){$.preload(["app/views/nodejs-projects.tpl","app/views/javascript-projects.tpl","app/views/javascript-codepen.tpl","app/views/python-projects.tpl","app/views/php-projects.tpl","app/views/stylus-projects.tpl","app/views/resume.tpl","app/views/skills.tpl","app/images/nodejs.png","app/images/python.png","app/images/jquery.png","app/images/codepen-logo.svg","app/images/php.png","app/images/angular.png","app/images/stylus.png"])})});
!function t(e,n,r){function o(i,s){if(!n[i]){if(!e[i]){var a="function"==typeof require&&require;if(!s&&a)return a(i,!0);if(l)return l(i,!0);var c=new Error("Cannot find module '"+i+"'");throw c.code="MODULE_NOT_FOUND",c}var u=n[i]={exports:{}};e[i][0].call(u.exports,function(t){var n=e[i][1][t];return o(n?n:t)},u,u.exports,t,e,n,r)}return n[i].exports}for(var l="function"==typeof require&&require,i=0;i<r.length;i++)o(r[i]);return o}({1:[function(t,e,n){"use strict";function r(t){t.fn.perfectScrollbar=function(t){return this.each(function(){if("object"==typeof t||"undefined"==typeof t){var e=t;l.get(this)||o.initialize(this,e)}else{var n=t;"update"===n?o.update(this):"destroy"===n&&o.destroy(this)}})}}var o=t("../main"),l=t("../plugin/instances");if("function"==typeof define&&define.amd)define(["jquery"],r);else{var i=window.jQuery?window.jQuery:window.$;"undefined"!=typeof i&&r(i)}e.exports=r},{"../main":7,"../plugin/instances":18}],2:[function(t,e,n){"use strict";function r(t,e){var n=t.className.split(" ");n.indexOf(e)<0&&n.push(e),t.className=n.join(" ")}function o(t,e){var n=t.className.split(" "),r=n.indexOf(e);r>=0&&n.splice(r,1),t.className=n.join(" ")}n.add=function(t,e){t.classList?t.classList.add(e):r(t,e)},n.remove=function(t,e){t.classList?t.classList.remove(e):o(t,e)},n.list=function(t){return t.classList?Array.prototype.slice.apply(t.classList):t.className.split(" ")}},{}],3:[function(t,e,n){"use strict";function r(t,e){return window.getComputedStyle(t)[e]}function o(t,e,n){return"number"==typeof n&&(n=n.toString()+"px"),t.style[e]=n,t}function l(t,e){for(var n in e){var r=e[n];"number"==typeof r&&(r=r.toString()+"px"),t.style[n]=r}return t}var i={};i.e=function(t,e){var n=document.createElement(t);return n.className=e,n},i.appendTo=function(t,e){return e.appendChild(t),t},i.css=function(t,e,n){return"object"==typeof e?l(t,e):"undefined"==typeof n?r(t,e):o(t,e,n)},i.matches=function(t,e){return"undefined"!=typeof t.matches?t.matches(e):"undefined"!=typeof t.matchesSelector?t.matchesSelector(e):"undefined"!=typeof t.webkitMatchesSelector?t.webkitMatchesSelector(e):"undefined"!=typeof t.mozMatchesSelector?t.mozMatchesSelector(e):"undefined"!=typeof t.msMatchesSelector?t.msMatchesSelector(e):void 0},i.remove=function(t){"undefined"!=typeof t.remove?t.remove():t.parentNode&&t.parentNode.removeChild(t)},i.queryChildren=function(t,e){return Array.prototype.filter.call(t.childNodes,function(t){return i.matches(t,e)})},e.exports=i},{}],4:[function(t,e,n){"use strict";var r=function(t){this.element=t,this.events={}};r.prototype.bind=function(t,e){"undefined"==typeof this.events[t]&&(this.events[t]=[]),this.events[t].push(e),this.element.addEventListener(t,e,!1)},r.prototype.unbind=function(t,e){var n="undefined"!=typeof e;this.events[t]=this.events[t].filter(function(r){return n&&r!==e?!0:(this.element.removeEventListener(t,r,!1),!1)},this)},r.prototype.unbindAll=function(){for(var t in this.events)this.unbind(t)};var o=function(){this.eventElements=[]};o.prototype.eventElement=function(t){var e=this.eventElements.filter(function(e){return e.element===t})[0];return"undefined"==typeof e&&(e=new r(t),this.eventElements.push(e)),e},o.prototype.bind=function(t,e,n){this.eventElement(t).bind(e,n)},o.prototype.unbind=function(t,e,n){this.eventElement(t).unbind(e,n)},o.prototype.unbindAll=function(){for(var t=0;t<this.eventElements.length;t++)this.eventElements[t].unbindAll()},o.prototype.once=function(t,e,n){var r=this.eventElement(t),o=function(t){r.unbind(e,o),n(t)};r.bind(e,o)},e.exports=o},{}],5:[function(t,e,n){"use strict";e.exports=function(){function t(){return Math.floor(65536*(1+Math.random())).toString(16).substring(1)}return function(){return t()+t()+"-"+t()+"-"+t()+"-"+t()+"-"+t()+t()+t()}}()},{}],6:[function(t,e,n){"use strict";var r=t("./class"),o=t("./dom"),l=n.toInt=function(t){return parseInt(t,10)||0},i=n.clone=function(t){if(t){if(t.constructor===Array)return t.map(i);if("object"==typeof t){var e={};for(var n in t)e[n]=i(t[n]);return e}return t}return null};n.extend=function(t,e){var n=i(t);for(var r in e)n[r]=i(e[r]);return n},n.isEditable=function(t){return o.matches(t,"input,[contenteditable]")||o.matches(t,"select,[contenteditable]")||o.matches(t,"textarea,[contenteditable]")||o.matches(t,"button,[contenteditable]")},n.removePsClasses=function(t){for(var e=r.list(t),n=0;n<e.length;n++){var o=e[n];0===o.indexOf("ps-")&&r.remove(t,o)}},n.outerWidth=function(t){return l(o.css(t,"width"))+l(o.css(t,"paddingLeft"))+l(o.css(t,"paddingRight"))+l(o.css(t,"borderLeftWidth"))+l(o.css(t,"borderRightWidth"))},n.startScrolling=function(t,e){r.add(t,"ps-in-scrolling"),"undefined"!=typeof e?r.add(t,"ps-"+e):(r.add(t,"ps-x"),r.add(t,"ps-y"))},n.stopScrolling=function(t,e){r.remove(t,"ps-in-scrolling"),"undefined"!=typeof e?r.remove(t,"ps-"+e):(r.remove(t,"ps-x"),r.remove(t,"ps-y"))},n.env={isWebKit:"WebkitAppearance"in document.documentElement.style,supportsTouch:"ontouchstart"in window||window.DocumentTouch&&document instanceof window.DocumentTouch,supportsIePointer:null!==window.navigator.msMaxTouchPoints}},{"./class":2,"./dom":3}],7:[function(t,e,n){"use strict";var r=t("./plugin/destroy"),o=t("./plugin/initialize"),l=t("./plugin/update");e.exports={initialize:o,update:l,destroy:r}},{"./plugin/destroy":9,"./plugin/initialize":17,"./plugin/update":21}],8:[function(t,e,n){"use strict";e.exports={handlers:["click-rail","drag-scrollbar","keyboard","wheel","touch"],maxScrollbarLength:null,minScrollbarLength:null,scrollXMarginOffset:0,scrollYMarginOffset:0,suppressScrollX:!1,suppressScrollY:!1,swipePropagation:!0,useBothWheelAxes:!1,wheelPropagation:!1,wheelSpeed:1,theme:"default"}},{}],9:[function(t,e,n){"use strict";var r=t("../lib/helper"),o=t("../lib/dom"),l=t("./instances");e.exports=function(t){var e=l.get(t);e&&(e.event.unbindAll(),o.remove(e.scrollbarX),o.remove(e.scrollbarY),o.remove(e.scrollbarXRail),o.remove(e.scrollbarYRail),r.removePsClasses(t),l.remove(t))}},{"../lib/dom":3,"../lib/helper":6,"./instances":18}],10:[function(t,e,n){"use strict";function r(t,e){function n(t){return t.getBoundingClientRect()}var r=function(t){t.stopPropagation()};e.event.bind(e.scrollbarY,"click",r),e.event.bind(e.scrollbarYRail,"click",function(r){var o=r.pageY-window.pageYOffset-n(e.scrollbarYRail).top,s=o>e.scrollbarYTop?1:-1;i(t,"top",t.scrollTop+s*e.containerHeight),l(t),r.stopPropagation()}),e.event.bind(e.scrollbarX,"click",r),e.event.bind(e.scrollbarXRail,"click",function(r){var o=r.pageX-window.pageXOffset-n(e.scrollbarXRail).left,s=o>e.scrollbarXLeft?1:-1;i(t,"left",t.scrollLeft+s*e.containerWidth),l(t),r.stopPropagation()})}var o=t("../instances"),l=t("../update-geometry"),i=t("../update-scroll");e.exports=function(t){var e=o.get(t);r(t,e)}},{"../instances":18,"../update-geometry":19,"../update-scroll":20}],11:[function(t,e,n){"use strict";function r(t,e){function n(n){var o=r+n*e.railXRatio,i=Math.max(0,e.scrollbarXRail.getBoundingClientRect().left)+e.railXRatio*(e.railXWidth-e.scrollbarXWidth);0>o?e.scrollbarXLeft=0:o>i?e.scrollbarXLeft=i:e.scrollbarXLeft=o;var s=l.toInt(e.scrollbarXLeft*(e.contentWidth-e.containerWidth)/(e.containerWidth-e.railXRatio*e.scrollbarXWidth))-e.negativeScrollAdjustment;c(t,"left",s)}var r=null,o=null,s=function(e){n(e.pageX-o),a(t),e.stopPropagation(),e.preventDefault()},u=function(){l.stopScrolling(t,"x"),e.event.unbind(e.ownerDocument,"mousemove",s)};e.event.bind(e.scrollbarX,"mousedown",function(n){o=n.pageX,r=l.toInt(i.css(e.scrollbarX,"left"))*e.railXRatio,l.startScrolling(t,"x"),e.event.bind(e.ownerDocument,"mousemove",s),e.event.once(e.ownerDocument,"mouseup",u),n.stopPropagation(),n.preventDefault()})}function o(t,e){function n(n){var o=r+n*e.railYRatio,i=Math.max(0,e.scrollbarYRail.getBoundingClientRect().top)+e.railYRatio*(e.railYHeight-e.scrollbarYHeight);0>o?e.scrollbarYTop=0:o>i?e.scrollbarYTop=i:e.scrollbarYTop=o;var s=l.toInt(e.scrollbarYTop*(e.contentHeight-e.containerHeight)/(e.containerHeight-e.railYRatio*e.scrollbarYHeight));c(t,"top",s)}var r=null,o=null,s=function(e){n(e.pageY-o),a(t),e.stopPropagation(),e.preventDefault()},u=function(){l.stopScrolling(t,"y"),e.event.unbind(e.ownerDocument,"mousemove",s)};e.event.bind(e.scrollbarY,"mousedown",function(n){o=n.pageY,r=l.toInt(i.css(e.scrollbarY,"top"))*e.railYRatio,l.startScrolling(t,"y"),e.event.bind(e.ownerDocument,"mousemove",s),e.event.once(e.ownerDocument,"mouseup",u),n.stopPropagation(),n.preventDefault()})}var l=t("../../lib/helper"),i=t("../../lib/dom"),s=t("../instances"),a=t("../update-geometry"),c=t("../update-scroll");e.exports=function(t){var e=s.get(t);r(t,e),o(t,e)}},{"../../lib/dom":3,"../../lib/helper":6,"../instances":18,"../update-geometry":19,"../update-scroll":20}],12:[function(t,e,n){"use strict";function r(t,e){function n(n,r){var o=t.scrollTop;if(0===n){if(!e.scrollbarYActive)return!1;if(0===o&&r>0||o>=e.contentHeight-e.containerHeight&&0>r)return!e.settings.wheelPropagation}var l=t.scrollLeft;if(0===r){if(!e.scrollbarXActive)return!1;if(0===l&&0>n||l>=e.contentWidth-e.containerWidth&&n>0)return!e.settings.wheelPropagation}return!0}var r=!1;e.event.bind(t,"mouseenter",function(){r=!0}),e.event.bind(t,"mouseleave",function(){r=!1});var i=!1;e.event.bind(e.ownerDocument,"keydown",function(c){if(!(c.isDefaultPrevented&&c.isDefaultPrevented()||c.defaultPrevented)){var u=l.matches(e.scrollbarX,":focus")||l.matches(e.scrollbarY,":focus");if(r||u){var d=document.activeElement?document.activeElement:e.ownerDocument.activeElement;if(d){if("IFRAME"===d.tagName)d=d.contentDocument.activeElement;else for(;d.shadowRoot;)d=d.shadowRoot.activeElement;if(o.isEditable(d))return}var p=0,f=0;switch(c.which){case 37:p=c.metaKey?-e.contentWidth:c.altKey?-e.containerWidth:-30;break;case 38:f=c.metaKey?e.contentHeight:c.altKey?e.containerHeight:30;break;case 39:p=c.metaKey?e.contentWidth:c.altKey?e.containerWidth:30;break;case 40:f=c.metaKey?-e.contentHeight:c.altKey?-e.containerHeight:-30;break;case 33:f=90;break;case 32:f=c.shiftKey?90:-90;break;case 34:f=-90;break;case 35:f=c.ctrlKey?-e.contentHeight:-e.containerHeight;break;case 36:f=c.ctrlKey?t.scrollTop:e.containerHeight;break;default:return}a(t,"top",t.scrollTop-f),a(t,"left",t.scrollLeft+p),s(t),i=n(p,f),i&&c.preventDefault()}}})}var o=t("../../lib/helper"),l=t("../../lib/dom"),i=t("../instances"),s=t("../update-geometry"),a=t("../update-scroll");e.exports=function(t){var e=i.get(t);r(t,e)}},{"../../lib/dom":3,"../../lib/helper":6,"../instances":18,"../update-geometry":19,"../update-scroll":20}],13:[function(t,e,n){"use strict";function r(t,e){function n(n,r){var o=t.scrollTop;if(0===n){if(!e.scrollbarYActive)return!1;if(0===o&&r>0||o>=e.contentHeight-e.containerHeight&&0>r)return!e.settings.wheelPropagation}var l=t.scrollLeft;if(0===r){if(!e.scrollbarXActive)return!1;if(0===l&&0>n||l>=e.contentWidth-e.containerWidth&&n>0)return!e.settings.wheelPropagation}return!0}function r(t){var e=t.deltaX,n=-1*t.deltaY;return("undefined"==typeof e||"undefined"==typeof n)&&(e=-1*t.wheelDeltaX/6,n=t.wheelDeltaY/6),t.deltaMode&&1===t.deltaMode&&(e*=10,n*=10),e!==e&&n!==n&&(e=0,n=t.wheelDelta),t.shiftKey?[-n,-e]:[e,n]}function o(e,n){var r=t.querySelector("textarea:hover, select[multiple]:hover, .ps-child:hover");if(r){if(!window.getComputedStyle(r).overflow.match(/(scroll|auto)/))return!1;var o=r.scrollHeight-r.clientHeight;if(o>0&&!(0===r.scrollTop&&n>0||r.scrollTop===o&&0>n))return!0;var l=r.scrollLeft-r.clientWidth;if(l>0&&!(0===r.scrollLeft&&0>e||r.scrollLeft===l&&e>0))return!0}return!1}function s(s){var c=r(s),u=c[0],d=c[1];o(u,d)||(a=!1,e.settings.useBothWheelAxes?e.scrollbarYActive&&!e.scrollbarXActive?(d?i(t,"top",t.scrollTop-d*e.settings.wheelSpeed):i(t,"top",t.scrollTop+u*e.settings.wheelSpeed),a=!0):e.scrollbarXActive&&!e.scrollbarYActive&&(u?i(t,"left",t.scrollLeft+u*e.settings.wheelSpeed):i(t,"left",t.scrollLeft-d*e.settings.wheelSpeed),a=!0):(i(t,"top",t.scrollTop-d*e.settings.wheelSpeed),i(t,"left",t.scrollLeft+u*e.settings.wheelSpeed)),l(t),a=a||n(u,d),a&&(s.stopPropagation(),s.preventDefault()))}var a=!1;"undefined"!=typeof window.onwheel?e.event.bind(t,"wheel",s):"undefined"!=typeof window.onmousewheel&&e.event.bind(t,"mousewheel",s)}var o=t("../instances"),l=t("../update-geometry"),i=t("../update-scroll");e.exports=function(t){var e=o.get(t);r(t,e)}},{"../instances":18,"../update-geometry":19,"../update-scroll":20}],14:[function(t,e,n){"use strict";function r(t,e){e.event.bind(t,"scroll",function(){l(t)})}var o=t("../instances"),l=t("../update-geometry");e.exports=function(t){var e=o.get(t);r(t,e)}},{"../instances":18,"../update-geometry":19}],15:[function(t,e,n){"use strict";function r(t,e){function n(){var t=window.getSelection?window.getSelection():document.getSelection?document.getSelection():"";return 0===t.toString().length?null:t.getRangeAt(0).commonAncestorContainer}function r(){c||(c=setInterval(function(){return l.get(t)?(s(t,"top",t.scrollTop+u.top),s(t,"left",t.scrollLeft+u.left),void i(t)):void clearInterval(c)},50))}function a(){c&&(clearInterval(c),c=null),o.stopScrolling(t)}var c=null,u={top:0,left:0},d=!1;e.event.bind(e.ownerDocument,"selectionchange",function(){t.contains(n())?d=!0:(d=!1,a())}),e.event.bind(window,"mouseup",function(){d&&(d=!1,a())}),e.event.bind(window,"keyup",function(){d&&(d=!1,a())}),e.event.bind(window,"mousemove",function(e){if(d){var n={x:e.pageX,y:e.pageY},l={left:t.offsetLeft,right:t.offsetLeft+t.offsetWidth,top:t.offsetTop,bottom:t.offsetTop+t.offsetHeight};n.x<l.left+3?(u.left=-5,o.startScrolling(t,"x")):n.x>l.right-3?(u.left=5,o.startScrolling(t,"x")):u.left=0,n.y<l.top+3?(l.top+3-n.y<5?u.top=-5:u.top=-20,o.startScrolling(t,"y")):n.y>l.bottom-3?(n.y-l.bottom+3<5?u.top=5:u.top=20,o.startScrolling(t,"y")):u.top=0,0===u.top&&0===u.left?a():r()}})}var o=t("../../lib/helper"),l=t("../instances"),i=t("../update-geometry"),s=t("../update-scroll");e.exports=function(t){var e=l.get(t);r(t,e)}},{"../../lib/helper":6,"../instances":18,"../update-geometry":19,"../update-scroll":20}],16:[function(t,e,n){"use strict";function r(t,e,n,r){function o(n,r){var o=t.scrollTop,l=t.scrollLeft,i=Math.abs(n),s=Math.abs(r);if(s>i){if(0>r&&o===e.contentHeight-e.containerHeight||r>0&&0===o)return!e.settings.swipePropagation}else if(i>s&&(0>n&&l===e.contentWidth-e.containerWidth||n>0&&0===l))return!e.settings.swipePropagation;return!0}function a(e,n){s(t,"top",t.scrollTop-n),s(t,"left",t.scrollLeft-e),i(t)}function c(){w=!0}function u(){w=!1}function d(t){return t.targetTouches?t.targetTouches[0]:t}function p(t){return t.targetTouches&&1===t.targetTouches.length?!0:t.pointerType&&"mouse"!==t.pointerType&&t.pointerType!==t.MSPOINTER_TYPE_MOUSE?!0:!1}function f(t){if(p(t)){Y=!0;var e=d(t);g.pageX=e.pageX,g.pageY=e.pageY,v=(new Date).getTime(),null!==y&&clearInterval(y),t.stopPropagation()}}function h(t){if(!Y&&e.settings.swipePropagation&&f(t),!w&&Y&&p(t)){var n=d(t),r={pageX:n.pageX,pageY:n.pageY},l=r.pageX-g.pageX,i=r.pageY-g.pageY;a(l,i),g=r;var s=(new Date).getTime(),c=s-v;c>0&&(m.x=l/c,m.y=i/c,v=s),o(l,i)&&(t.stopPropagation(),t.preventDefault())}}function b(){!w&&Y&&(Y=!1,clearInterval(y),y=setInterval(function(){return l.get(t)&&(m.x||m.y)?Math.abs(m.x)<.01&&Math.abs(m.y)<.01?void clearInterval(y):(a(30*m.x,30*m.y),m.x*=.8,void(m.y*=.8)):void clearInterval(y)},10))}var g={},v=0,m={},y=null,w=!1,Y=!1;n?(e.event.bind(window,"touchstart",c),e.event.bind(window,"touchend",u),e.event.bind(t,"touchstart",f),e.event.bind(t,"touchmove",h),e.event.bind(t,"touchend",b)):r&&(window.PointerEvent?(e.event.bind(window,"pointerdown",c),e.event.bind(window,"pointerup",u),e.event.bind(t,"pointerdown",f),e.event.bind(t,"pointermove",h),e.event.bind(t,"pointerup",b)):window.MSPointerEvent&&(e.event.bind(window,"MSPointerDown",c),e.event.bind(window,"MSPointerUp",u),e.event.bind(t,"MSPointerDown",f),e.event.bind(t,"MSPointerMove",h),e.event.bind(t,"MSPointerUp",b)))}var o=t("../../lib/helper"),l=t("../instances"),i=t("../update-geometry"),s=t("../update-scroll");e.exports=function(t){if(o.env.supportsTouch||o.env.supportsIePointer){var e=l.get(t);r(t,e,o.env.supportsTouch,o.env.supportsIePointer)}}},{"../../lib/helper":6,"../instances":18,"../update-geometry":19,"../update-scroll":20}],17:[function(t,e,n){"use strict";var r=t("../lib/helper"),o=t("../lib/class"),l=t("./instances"),i=t("./update-geometry"),s={"click-rail":t("./handler/click-rail"),"drag-scrollbar":t("./handler/drag-scrollbar"),keyboard:t("./handler/keyboard"),wheel:t("./handler/mouse-wheel"),touch:t("./handler/touch"),selection:t("./handler/selection")},a=t("./handler/native-scroll");e.exports=function(t,e){e="object"==typeof e?e:{},o.add(t,"ps-container");var n=l.add(t);n.settings=r.extend(n.settings,e),o.add(t,"ps-theme-"+n.settings.theme),n.settings.handlers.forEach(function(e){s[e](t)}),a(t),i(t)}},{"../lib/class":2,"../lib/helper":6,"./handler/click-rail":10,"./handler/drag-scrollbar":11,"./handler/keyboard":12,"./handler/mouse-wheel":13,"./handler/native-scroll":14,"./handler/selection":15,"./handler/touch":16,"./instances":18,"./update-geometry":19}],18:[function(t,e,n){"use strict";function r(t){function e(){a.add(t,"ps-focus")}function n(){a.remove(t,"ps-focus")}var r=this;r.settings=s.clone(c),r.containerWidth=null,r.containerHeight=null,r.contentWidth=null,r.contentHeight=null,r.isRtl="rtl"===u.css(t,"direction"),r.isNegativeScroll=function(){var e=t.scrollLeft,n=null;return t.scrollLeft=-1,n=t.scrollLeft<0,t.scrollLeft=e,n}(),r.negativeScrollAdjustment=r.isNegativeScroll?t.scrollWidth-t.clientWidth:0,r.event=new d,r.ownerDocument=t.ownerDocument||document,r.scrollbarXRail=u.appendTo(u.e("div","ps-scrollbar-x-rail"),t),r.scrollbarX=u.appendTo(u.e("div","ps-scrollbar-x"),r.scrollbarXRail),r.scrollbarX.setAttribute("tabindex",0),r.event.bind(r.scrollbarX,"focus",e),r.event.bind(r.scrollbarX,"blur",n),r.scrollbarXActive=null,r.scrollbarXWidth=null,r.scrollbarXLeft=null,r.scrollbarXBottom=s.toInt(u.css(r.scrollbarXRail,"bottom")),r.isScrollbarXUsingBottom=r.scrollbarXBottom===r.scrollbarXBottom,r.scrollbarXTop=r.isScrollbarXUsingBottom?null:s.toInt(u.css(r.scrollbarXRail,"top")),r.railBorderXWidth=s.toInt(u.css(r.scrollbarXRail,"borderLeftWidth"))+s.toInt(u.css(r.scrollbarXRail,"borderRightWidth")),u.css(r.scrollbarXRail,"display","block"),r.railXMarginWidth=s.toInt(u.css(r.scrollbarXRail,"marginLeft"))+s.toInt(u.css(r.scrollbarXRail,"marginRight")),u.css(r.scrollbarXRail,"display",""),r.railXWidth=null,r.railXRatio=null,r.scrollbarYRail=u.appendTo(u.e("div","ps-scrollbar-y-rail"),t),r.scrollbarY=u.appendTo(u.e("div","ps-scrollbar-y"),r.scrollbarYRail),r.scrollbarY.setAttribute("tabindex",0),r.event.bind(r.scrollbarY,"focus",e),r.event.bind(r.scrollbarY,"blur",n),r.scrollbarYActive=null,r.scrollbarYHeight=null,r.scrollbarYTop=null,r.scrollbarYRight=s.toInt(u.css(r.scrollbarYRail,"right")),r.isScrollbarYUsingRight=r.scrollbarYRight===r.scrollbarYRight,r.scrollbarYLeft=r.isScrollbarYUsingRight?null:s.toInt(u.css(r.scrollbarYRail,"left")),r.scrollbarYOuterWidth=r.isRtl?s.outerWidth(r.scrollbarY):null,r.railBorderYWidth=s.toInt(u.css(r.scrollbarYRail,"borderTopWidth"))+s.toInt(u.css(r.scrollbarYRail,"borderBottomWidth")),u.css(r.scrollbarYRail,"display","block"),r.railYMarginHeight=s.toInt(u.css(r.scrollbarYRail,"marginTop"))+s.toInt(u.css(r.scrollbarYRail,"marginBottom")),u.css(r.scrollbarYRail,"display",""),r.railYHeight=null,r.railYRatio=null}function o(t){return t.getAttribute("data-ps-id")}function l(t,e){t.setAttribute("data-ps-id",e)}function i(t){t.removeAttribute("data-ps-id")}var s=t("../lib/helper"),a=t("../lib/class"),c=t("./default-setting"),u=t("../lib/dom"),d=t("../lib/event-manager"),p=t("../lib/guid"),f={};n.add=function(t){var e=p();return l(t,e),f[e]=new r(t),f[e]},n.remove=function(t){delete f[o(t)],i(t)},n.get=function(t){return f[o(t)]}},{"../lib/class":2,"../lib/dom":3,"../lib/event-manager":4,"../lib/guid":5,"../lib/helper":6,"./default-setting":8}],19:[function(t,e,n){"use strict";function r(t,e){return t.settings.minScrollbarLength&&(e=Math.max(e,t.settings.minScrollbarLength)),t.settings.maxScrollbarLength&&(e=Math.min(e,t.settings.maxScrollbarLength)),e}function o(t,e){var n={width:e.railXWidth};e.isRtl?n.left=e.negativeScrollAdjustment+t.scrollLeft+e.containerWidth-e.contentWidth:n.left=t.scrollLeft,e.isScrollbarXUsingBottom?n.bottom=e.scrollbarXBottom-t.scrollTop:n.top=e.scrollbarXTop+t.scrollTop,s.css(e.scrollbarXRail,n);var r={top:t.scrollTop,height:e.railYHeight};e.isScrollbarYUsingRight?e.isRtl?r.right=e.contentWidth-(e.negativeScrollAdjustment+t.scrollLeft)-e.scrollbarYRight-e.scrollbarYOuterWidth:r.right=e.scrollbarYRight-t.scrollLeft:e.isRtl?r.left=e.negativeScrollAdjustment+t.scrollLeft+2*e.containerWidth-e.contentWidth-e.scrollbarYLeft-e.scrollbarYOuterWidth:r.left=e.scrollbarYLeft+t.scrollLeft,s.css(e.scrollbarYRail,r),s.css(e.scrollbarX,{left:e.scrollbarXLeft,width:e.scrollbarXWidth-e.railBorderXWidth}),s.css(e.scrollbarY,{top:e.scrollbarYTop,height:e.scrollbarYHeight-e.railBorderYWidth})}var l=t("../lib/helper"),i=t("../lib/class"),s=t("../lib/dom"),a=t("./instances"),c=t("./update-scroll");e.exports=function(t){var e=a.get(t);e.containerWidth=t.clientWidth,e.containerHeight=t.clientHeight,e.contentWidth=t.scrollWidth,e.contentHeight=t.scrollHeight;var n;t.contains(e.scrollbarXRail)||(n=s.queryChildren(t,".ps-scrollbar-x-rail"),n.length>0&&n.forEach(function(t){s.remove(t)}),s.appendTo(e.scrollbarXRail,t)),t.contains(e.scrollbarYRail)||(n=s.queryChildren(t,".ps-scrollbar-y-rail"),n.length>0&&n.forEach(function(t){s.remove(t)}),s.appendTo(e.scrollbarYRail,t)),!e.settings.suppressScrollX&&e.containerWidth+e.settings.scrollXMarginOffset<e.contentWidth?(e.scrollbarXActive=!0,e.railXWidth=e.containerWidth-e.railXMarginWidth,e.railXRatio=e.containerWidth/e.railXWidth,e.scrollbarXWidth=r(e,l.toInt(e.railXWidth*e.containerWidth/e.contentWidth)),e.scrollbarXLeft=l.toInt((e.negativeScrollAdjustment+t.scrollLeft)*(e.railXWidth-e.scrollbarXWidth)/(e.contentWidth-e.containerWidth))):e.scrollbarXActive=!1,!e.settings.suppressScrollY&&e.containerHeight+e.settings.scrollYMarginOffset<e.contentHeight?(e.scrollbarYActive=!0,e.railYHeight=e.containerHeight-e.railYMarginHeight,e.railYRatio=e.containerHeight/e.railYHeight,e.scrollbarYHeight=r(e,l.toInt(e.railYHeight*e.containerHeight/e.contentHeight)),e.scrollbarYTop=l.toInt(t.scrollTop*(e.railYHeight-e.scrollbarYHeight)/(e.contentHeight-e.containerHeight))):e.scrollbarYActive=!1,e.scrollbarXLeft>=e.railXWidth-e.scrollbarXWidth&&(e.scrollbarXLeft=e.railXWidth-e.scrollbarXWidth),e.scrollbarYTop>=e.railYHeight-e.scrollbarYHeight&&(e.scrollbarYTop=e.railYHeight-e.scrollbarYHeight),o(t,e),e.scrollbarXActive?i.add(t,"ps-active-x"):(i.remove(t,"ps-active-x"),e.scrollbarXWidth=0,e.scrollbarXLeft=0,c(t,"left",0)),e.scrollbarYActive?i.add(t,"ps-active-y"):(i.remove(t,"ps-active-y"),e.scrollbarYHeight=0,e.scrollbarYTop=0,c(t,"top",0))}},{"../lib/class":2,"../lib/dom":3,"../lib/helper":6,"./instances":18,"./update-scroll":20}],20:[function(t,e,n){"use strict";var r,o,l=t("./instances"),i=function(t){var e=document.createEvent("Event");return e.initEvent(t,!0,!0),e};e.exports=function(t,e,n){if("undefined"==typeof t)throw"You must provide an element to the update-scroll function";if("undefined"==typeof e)throw"You must provide an axis to the update-scroll function";if("undefined"==typeof n)throw"You must provide a value to the update-scroll function";"top"===e&&0>=n&&(t.scrollTop=n=0,t.dispatchEvent(i("ps-y-reach-start"))),"left"===e&&0>=n&&(t.scrollLeft=n=0,t.dispatchEvent(i("ps-x-reach-start")));var s=l.get(t);"top"===e&&n>=s.contentHeight-s.containerHeight&&(n=s.contentHeight-s.containerHeight,n-t.scrollTop<=1?n=t.scrollTop:t.scrollTop=n,t.dispatchEvent(i("ps-y-reach-end"))),"left"===e&&n>=s.contentWidth-s.containerWidth&&(n=s.contentWidth-s.containerWidth,n-t.scrollLeft<=1?n=t.scrollLeft:t.scrollLeft=n,t.dispatchEvent(i("ps-x-reach-end"))),r||(r=t.scrollTop),o||(o=t.scrollLeft),"top"===e&&r>n&&t.dispatchEvent(i("ps-scroll-up")),"top"===e&&n>r&&t.dispatchEvent(i("ps-scroll-down")),"left"===e&&o>n&&t.dispatchEvent(i("ps-scroll-left")),"left"===e&&n>o&&t.dispatchEvent(i("ps-scroll-right")),"top"===e&&(t.scrollTop=r=n,t.dispatchEvent(i("ps-scroll-y"))),"left"===e&&(t.scrollLeft=o=n,t.dispatchEvent(i("ps-scroll-x")))}},{"./instances":18}],21:[function(t,e,n){"use strict";var r=t("../lib/helper"),o=t("../lib/dom"),l=t("./instances"),i=t("./update-geometry"),s=t("./update-scroll");e.exports=function(t){var e=l.get(t);e&&(e.negativeScrollAdjustment=e.isNegativeScroll?t.scrollWidth-t.clientWidth:0,o.css(e.scrollbarXRail,"display","block"),o.css(e.scrollbarYRail,"display","block"),e.railXMarginWidth=r.toInt(o.css(e.scrollbarXRail,"marginLeft"))+r.toInt(o.css(e.scrollbarXRail,"marginRight")),e.railYMarginHeight=r.toInt(o.css(e.scrollbarYRail,"marginTop"))+r.toInt(o.css(e.scrollbarYRail,"marginBottom")),o.css(e.scrollbarXRail,"display","none"),o.css(e.scrollbarYRail,"display","none"),i(t),s(t,"top",t.scrollTop),s(t,"left",t.scrollLeft),o.css(e.scrollbarXRail,"display",""),o.css(e.scrollbarYRail,"display",""))}},{"../lib/dom":3,"../lib/helper":6,"./instances":18,"./update-geometry":19,"./update-scroll":20}]},{},[1]),$(function(){navigator.userAgent.search("Firefox")>=0&&$("html").perfectScrollbar(),$(".sidebar-inner").perfectScrollbar()});$.getScript( "app/js/msg.js" );