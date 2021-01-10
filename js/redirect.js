var GITHUB_ISSUES_LINK = "https://api.github.com/repos/b177y/url-shortener/issues?per_page=100";

var enabledUsers = {
  'b177y': {
      prefix: '',
      sleep_time: 500,
      for_name: "@b177y",
  },
  'juliakathh': {
      prefix: 'jl/',
      sleep_time: 3000,
      for_name: "@juliakathh",
  },
  'guest': {
      prefix: "gst/",
      sleep_time: 5000,
  }
};

function isUrl(url) {
    return /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,24}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)+$/.test(
      url
    );
}

function show_error(title, subtext){
    document.getElementById("redirect_msg").innerHTML = title;
    document.getElementById("redirect_sub").innerHTML = subtext;
}

function redirect(url, user){
    document.getElementById("redirect_msg").innerHTML = "Redirecting for " + enabledUsers[user].for_name;
    console.log("Boutta sleep");
    setTimeout(function () { 
    console.log("Slept");
        location.replace(url);
    }, enabledUsers[user].sleep_time);
}

function check_redirect() {
    var location = window.location;
    var linkId = location.pathname.trim().substring(1);
    var indexPage = "https://billy.rip";
    var invalidUserPage = "https://billy.rip/invaliduser";

    var indexPage = "http://localhost:8000";
    var invalidUserPage = "http://localhost:8000/invaliduser.html";

    var xhr = new XMLHttpRequest();

    xhr.onload = function () {
        try {
            console.log("PATHNAME" + location.pathname);
            var payload = JSON.parse(xhr.response);
            for (var i = 0; i < payload.length; i++) {
                var issue = payload[i];
                title = issue.title.trim();
                body = issue.body.trim();
                user = issue.user.login.trim();
                if (!(user in enabledUsers)){
                    enabledUsers['guest']['for_name'] = "@" + user + " (Guest)"
                    user = 'guest';
                }
                title = enabledUsers[user].prefix + title;
                labels = issue.labels;
                console.log(title, body, user, labels);
                console.log("COMPARING LINKID: " + linkId + " TO TITLE: " + title);
                if (linkId == title){
                    if (user === "guest"){
                        console.log("Link added by guest user.");
                        var authorisedGuest = false;
                        for (var j = 0; j < labels.length; j++){
                           if (labels[j].name == "redirect-authorised"){
                               console.log("Redirect is authorised");
                               authorisedGuest = true;
                           }
                        }
                        if (!authorisedGuest){
                            show_error("Redirect Link Not Authorised", "Make sure @b177y has authorised your redirect!");
                            return;
                        }
                    } else {
                        console.log("User " + user + " is authorised.");
                    }
                if (!(isUrl(body))){
                    show_error("Error: Not A Link",
                        "Link submitted by " + enabledUsers[user].for_name + " is not recognised as a valid link.");
                    console.log("Body of GitHub Issue is not a url... Redirecting to: " + indexPage);
                    return;
                }
                redirect(body, user)
                return;
            }
        }
        console.log("Link is not found in issues... Redirecting to: " + indexPage);
        show_error("Invalid Link", "");
        return;
    } catch (e) {
        console.log("Unkown error... Redirecting to: " + indexPage);
        show_error("Unkown Error.", "");
        return;
      }
    }

    xhr.onerror = function () {
      show_error("Error Fetching Links.", "");
      return;
    };

    xhr.open("GET", GITHUB_ISSUES_LINK);
    xhr.send();
}

check_redirect();
