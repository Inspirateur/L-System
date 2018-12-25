let tokenInRule = {};
let ruleHasToken = {};
let canvas = document.getElementById("window");
let ctx = canvas.getContext("2d");
let fastlock = false;

//TODO: Implement a lock fast-slow and redraw upon angle/order modification
function build(fast) {
    fastlock = fast;
    console.log(`received build (${fast? 'fast':'slow'} mode)`);
    // TODO: BUILD RULES OBJECT FROM THE HTML RULE FIELDS AND CALL LSYSTEM
    let rules = {};
    // get angle and order from HTML fields
    rules["angle"] = parseInt(document.getElementById("angle").value.trim(), 10);
    let order = parseInt(document.getElementById("order").value.trim(), 10);
    // get the rules from HTML fields
    let ruleDivs = document.getElementsByClassName("rule");
    for(let i=0; i<ruleDivs.length; i++) {
        let token = ruleDivs[i].childNodes[0].nodeValue.trim()[0];
        let rule = ruleDivs[i].childNodes[1].value.trim();
        rules[token] = rule;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    lsystem(rules, order, ctx, canvas.width, canvas.height, fast);
}

function updateParam() {
    console.log("test");
    if(fastlock) {
        build(true);
    }
}

function addRef(token, englobingToken) {
    if(token != englobingToken) {
        if(token in tokenInRule) {
            tokenInRule[token].add(englobingToken);
        } else {
            tokenInRule[token] = new Set([englobingToken]);
        }

        if(englobingToken in ruleHasToken) {
            ruleHasToken[englobingToken].add(token);
        } else {
            ruleHasToken[englobingToken] = new Set([token]);
        }
    }
}

function removeRef(token, englobingToken) {
    ruleHasToken[englobingToken].delete(token);
    tokenInRule[token].delete(englobingToken);
}

function isNotRef(token) {
    return !(token in tokenInRule) || (tokenInRule[token].size == 0);
}

function writeHTMLRule(token, rule) {
    let textInput = document.getElementById(token);
    if(textInput != null) {
        textInput.value = rule.trim();
        updateHTMLRule(token);
    }
}

function clearHTMLRules() {
    tokenInRule = {};
    ruleHasToken = {};
    let ruleDivs = document.getElementsByClassName("rule");
    let i=0;
    while(i<ruleDivs.length) {
        let token = ruleDivs[i].childNodes[0].nodeValue.trim()[0];
        if(token != 'S') {
            removeHTMLRule(token);
        } else {
            i++;
        }
    }
}

function createHTMLRule(token) {
    let rulesDiv = document.getElementById("rules");
    let ruleDiv = document.createElement("div");
    ruleDiv.className = "rule";
    ruleDiv.innerHTML = `${token} → `;
    let inputField = document.createElement("input");
    inputField.setAttribute("type", "text");
    inputField.setAttribute("name", "rule");
    inputField.setAttribute("id", token);
    inputField.setAttribute("oninput", `updateHTMLRule('${token}')`);
    ruleDiv.appendChild(inputField);
    rulesDiv.appendChild(ruleDiv);
}

function removeHTMLRule(token) {
    // To make sure every reference is removed
    writeHTMLRule(token, "");
    // Remove the HTML field
    let inputField = document.getElementById(token);
    if(inputField != null) {
        let ruleDiv = inputField.parentNode;
        document.getElementById("rules").removeChild(ruleDiv);
    }
}

function updateHTMLRule(token) {
    let textInput = document.getElementById(token);
    let rule = textInput.value.trim();
    // An old list containing references in the token rule
    let outdatedRef = new Set([]);
    if(token in ruleHasToken) {
        outdatedRef = refCopy(ruleHasToken[token]);
    }
    // Check every token of the updated rule
    for(let i=0; i<rule.length; i++) {
        // If token i is not terminal
        if(!isTerminal(rule[i])) {
            // Registers that token i is referenced in rule token
            addRef(rule[i], token);
            // Remove it from outdatedRef if possible
            if(outdatedRef.has(rule[i])) {
                outdatedRef.delete(rule[i]);
            }
            // Check if an Input Field deriving token i exists
            let otherInput = document.getElementById(rule[i]);
            if(otherInput == null) {
                // It doesn't exist, need to create it
                createHTMLRule(rule[i]);
            }
        }
    }
    // Every token remaining in outdatedRef is outdated, we'll remove it
    for(let outdatedToken of outdatedRef) {
        removeRef(outdatedToken, token);
        // Check if the outdatedToken has at least one reference left
        if(isNotRef(outdatedToken)) {
            // No reference left, we remove the HTML field
            removeHTMLRule(outdatedToken);
        }
    }
}

function recursiveHTMLRuleWritting(ruleSet, previousToken) {
    // If there's still rules to be written
    if(Object.keys(ruleSet).length > 0) {
        // for each references created by the previousToken
        for(ref of ruleHasToken[previousToken]) {
            if(ref in ruleSet) {
                // Fill in the HTML field
                writeHTMLRule(ref, ruleSet[ref]);
                // Delete it from the ruleSet so we don't fill it again
                delete ruleSet[ref];
                // Add all of his new references to the HTML
                recursiveHTMLRuleWritting(ruleSet, ref);
            }
        }
    }
}

function loadPreset(stringRules){
    // Clear every field except the Axiom
    clearHTMLRules();
    // Parse the rules
    let rules = string2Rules(stringRules);
    // Separate angle from the rules
    let angle = rules["angle"];
    delete rules["angle"];

    // Fill the axiom field
    let startToken = 'S';
    writeHTMLRule(startToken, rules['S']);
    delete rules['S'];
    // Fill all the subsequent HTML fields
    recursiveHTMLRuleWritting(rules, startToken)

    // Fill the angle field
    document.getElementById("angle").value = angle.toString();
}

function makePreset(name, rules) {
    let div = document.createElement("div");
    div.className = "preset";
    let title = document.createElement("h4");
    title.innerHTML = name;
    div.appendChild(title);
    let span = document.createElement("span");
    span.innerHTML = rule2HTML(rules);
    div.appendChild(span);
    div.setAttribute("onclick", `loadPreset('${rule2String(rules)}')`);
    return div;
}

function makePresets(){
    let presets = {
        "dragon": {'S': "fX", 'X': "X+Yf+", 'Y': "-fX-Y", "angle": 90},
        "hillbert": {'S': "L", 'L': "+Rf-LfL-fR+", 'R': "-Lf+RfR+fL-", "angle": 90},
        "sierpinski": {'S': "ZYf", 'X': "Yf+Xf+Y", 'Y': "Xf-Yf-X", 'Z': "+W", 'W': "-Z", "angle": 60}
    }

    let presetlist = document.getElementById("presetlist");
    // Loading the presets in the preset div
    for(key in presets) {
        presetlist.appendChild(makePreset(key, presets[key]));
    }
}

//THE REFERENCES ARE ACTUALLY WAY MORE COMPLICATED THAN THAT (YOU HAVE TO CHECK FOR CLOSED REFERENCE LOOP) so maybe upgrade it later
function main() {
    makePresets();
}

main()
