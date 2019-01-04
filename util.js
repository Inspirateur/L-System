function hue2rgb(p, q, t) {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1/6) return p + (q - p) * 6 * t;
    if (t < 1/2) return q;
    if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
    return p;
}

function hslToRgb(h, s, l) {
    // Convert HSL representation of color to RBG Hex string
    let r, g, b;
    if (s == 0) {
        r = g = b = l; // Achromatic
    } else {
        let q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        let p = 2 * l - q;
        r = hue2rgb(p, q, h + 1/3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1/3);
    }
    return `rgb(${r * 255}, ${g * 255}, ${b * 255})`;
}

function log_rules(rules, angle, order) {
    for(let key in rules) {
        if(key != "angle") {
            console.log(`${key} -> ${rules[key]}`);
        }
    }
    console.log(`Angle: ${angle} | Order: ${order}`);
}

function rule2HTML(rules) {
    res = ""
    let i=0;
    for(let key in rules) {
        if(key != "angle") {
            if(i > 4){
                res += "... <br/>";
                break;
            }
            res += `${key} → ${rules[key]} <br/>`;
        }
        i++;
    }
    res += `angle: ${rules.angle}°`;
    return res;
}

function rule2String(rules) {
    res = ""
    for(let key in rules){
        res += `${key}:${rules[key]},`
    }
    return res.substring(0, res.length-1);
}

function string2Rules(stringRules) {
    let ruleArray = stringRules.split(',');
    let res = {};
    let key_rule;
    for(let i=0; i<ruleArray.length; i++) {
        key_rule = ruleArray[i].split(':');
        res[key_rule[0]] = key_rule[1];
    }
    return res;
}

function pretty_num(x){
    xstr = x.toString(10);
    rep = "";

    for(let i=0; i<xstr.length; i++){
        rep += xstr[i];
        if((xstr.length-i-1)%3 == 0 && i != xstr.length-1){
            rep += ",";
        }
    }
    return rep;
}

function isTerminal(token) {
    return token == 'f' || token == '+' || token == '-';
}

function refCopy(refSet) {
    res = new Set([]);
    for(let ref of refSet) {
        res.add(ref);
    }
    return res;
}
