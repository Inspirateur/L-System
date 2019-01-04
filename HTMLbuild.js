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

function writeHTMLRule(token, rule, preset=false) {
    let textInput = document.getElementById(token);
    if(textInput != null) {
        textInput.value = rule.trim();
        updateHTMLRule(token, preset);
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
            removeHTMLRule(token, true);
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

function removeHTMLRule(token, preset=false) {
    if(token != 'S') {
        // To make sure every reference is removed
        writeHTMLRule(token, "", preset);
        // Remove the HTML field
        let inputField = document.getElementById(token);
        if(inputField != null) {
            let ruleDiv = inputField.parentNode;
            document.getElementById("rules").removeChild(ruleDiv);
        }
    }
}

function updateHTMLRule(token, preset=false) {
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

    // Call the fast build if it's a manual update
    if(!preset) {
        build(true);
    }
}

function recursiveHTMLRuleWritting(ruleSet, previousToken) {
    // If there's still rules to be written
    if(Object.keys(ruleSet).length > 0) {
        // for each references created by the previousToken
        for(ref of ruleHasToken[previousToken]) {
            if(ref in ruleSet) {
                // Fill in the HTML field
                writeHTMLRule(ref, ruleSet[ref], true);
                // Delete it from the ruleSet so we don't fill it again
                delete ruleSet[ref];
                // Add all of his new references to the HTML
                recursiveHTMLRuleWritting(ruleSet, ref);
            }
        }
    }
}
