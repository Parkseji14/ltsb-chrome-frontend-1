$(document).on('click','#options_btn',function(){
    window.open('options.html');
});

const domainRegExp = /^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:\/\n\?\=]+)/im;

// TODO 근데 이런식으로 하면 나머지 기능 테스트 되게 어려워질텐데.
function loadOptions(callback){
    chrome.runtime.sendMessage({msg_type : "get"}, function(userOption) {
        console.log(userOption);
        callback(userOption);
    });
}

function domain_from_url(url) {
    let result
    let match
    if (match = url.match(domainRegExp)) {
        result = match[1]
        if (match = result.match(/^[^\.]+\.(.+\..+)$/)) {
            result = match[1]
        }
    }
    return result
}

function applyConfig(configKey, configValue){
    //TODO popup에서도 설정 저장하고 있어야 한다
    chrome.runtime.sendMessage({msg_type : "set", target_obj : {[configKey] : configValue}},
        function(response) {console.log(response);});
}

function getCurrentURL(){
    return new Promise((resolve,reject)=>{
        chrome.tabs.query({currentWindow : true, active: true}, function(tabs){
            resolve(tabs[0].url);
        });
    });
}

loadOptions((userOption)=> {
    $(document).ready(function () {
        // chrome.runtime.sendMessage({msg_type : "set_words", target_obj : { movie_id : 475557, title : "Joker"}}, function(response) { console.log(response); });

        const modal = $('#exclude-modal');

        const currentBtn = $("#current-btn");
        const domainBtn = $("#domain-btn");

        const alert = $(".alert");

        function handleChooseExcludeRangeBtn(caller, attrName) {
            const excludeLifeSpan = modal.attr('data-lifespan');

            modal.css('display', 'none');
            const targetAddr = caller.attr(attrName);
            console.log(targetAddr);

            console.log(Object.keys(userOption));

            const existingSites = userOption[excludeLifeSpan];
            // console.log(existingSites);
            // undefined

            existingSites.push(targetAddr);

            // TODO 제대로 주소 채워넣기. 통채로 전달하는 방식임.
            applyConfig(excludeLifeSpan,existingSites);

            alert.css('display', 'block');
        }

        async function handleExcludeBtn(excludeLifeSpan) {
            console.log('exclude btn clicked');

            modal.attr('data-lifespan', excludeLifeSpan);

            const curAddr = await getCurrentURL();
            $('#cur-addr-paragraph').text("현재 페이지 : " +curAddr);
            currentBtn.attr('data-cur', curAddr);

            const domainAddr = domain_from_url(curAddr);
            $('#domain-addr-paragraph').text("도메인 : " + domainAddr);
            domainBtn.attr('data-domain', domainAddr);

            modal.css('display', 'block');
        }

        $("#temp-btn").click(function () {
            handleExcludeBtn("tempExcludedSites");
        });

        $("#permanent-btn").click(function () {
            handleExcludeBtn("excludedSites");
        });

        $("#close-exclude-modal").click(function () {
            modal.css('display', 'none');
        });

        currentBtn.click(function () {
            handleChooseExcludeRangeBtn($(this), "data-cur");
        });
        domainBtn.click(function () {
            handleChooseExcludeRangeBtn($(this), "data-domain");
        });

        $(".alert-close-btn").click(function () {
            alert.css('display', 'none');
        });

        $("#blockdecision").change(function () {
            let isBlockingEnabled;
            if ($(this).is(":checked")) {
                console.log("체크");
                isBlockingEnabled = true;
            } else {
                console.log("체크 해제");
                isBlockingEnabled = false;
            }
            applyConfig("isBlockingEnabled", isBlockingEnabled);
        });

        $("#bodyblock").change(function () {
            let doesBlockAllContents;
            if ($(this).is(":checked")) {
                console.log("체크");
                doesBlockAllContents = true;
            } else {
                console.log("체크 해제");
                doesBlockAllContents = false;
            }
            applyConfig("doesBlockAllContents", doesBlockAllContents);
        });
    })
});


