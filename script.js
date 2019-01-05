let canvas = document.getElementById("window");
let ctx = canvas.getContext("2d");
let tokenInRule = {};
let ruleHasToken = {};
let previousLines = 1000;

//TODO: Implement a lock fast-slow and redraw upon angle/order modification
function build(fast, rulechange=true) {
    console.log(`received build (${fast? 'fast':'slow'} mode)`);
    // TODO: BUILD RULES OBJECT FROM THE HTML RULE FIELDS AND CALL LSYSTEM
    let rules = {};
    // get angle and order from HTML fields
    let angle = parseInt(document.getElementById("angle").value.trim(), 10);
    let order = parseInt(document.getElementById("order").value.trim(), 10);
    // get the rules from HTML fields
    let ruleDivs = document.getElementsByClassName("rule");
    for(let i=0; i<ruleDivs.length; i++) {
        let token = ruleDivs[i].childNodes[0].nodeValue.trim()[0];
        let rule = ruleDivs[i].childNodes[1].value.trim();
        rules[token] = rule;
    }

    try {
        // Compute the lines efficiently
        let lineorder = fcount(rules);
        let actualLines = lineorder(order);
        // If the new line count is too high (due to rule change)
        if(rulechange && actualLines > 4000 && actualLines > previousLines) {
            // Get the line count down to a reasonable level by lowering the order
            for(let i=order-1; i > 3; i--) {
                actualLines = lineorder(i);
                if(actualLines <= previousLines) {
                    document.getElementById("order").value = i;
                    order = i;
                    break;
                }
            }
        }
        if(rulechange && actualLines > previousLines) {
            document.getElementById("order").value = 3;
            order = 3;
        }
        previousLines = actualLines;
    } catch(err) {
        console.log("Couldn't estimate line count (non-invertible matrix), the drawing might take a while");
    }
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    lsystem(rules, angle, order, ctx, canvas.width, canvas.height, fast);
}

function updateParam() {
    build(true, false);
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
    writeHTMLRule(startToken, rules['S'], true);
    delete rules['S'];
    // Fill all the subsequent HTML fields
    recursiveHTMLRuleWritting(rules, startToken)

    // Fill the angle field
    document.getElementById("angle").value = angle.toString();

    // Build directly in fastmode
    build(true);
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
