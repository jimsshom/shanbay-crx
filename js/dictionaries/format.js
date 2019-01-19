
function renderEnDef_fl(fl) {
    if (fl == 'verb') {//是verb一定会有vd
        return '';
    }
    return '<div class="span8"><span class="part-of-speech label">' + fl + '</span></div>';
}

function renderEnDef_vd(vd) {
    return '<div class="span8"><span class="part-of-speech label">' + vd + '</span></div>';
}

function renderEnDef_sn(sn) {
    sn = sn.replace(/\(\d+\)/g, '');
    if (sn == '') {
        return '<div style="clear:both"/><div class="span1" style="width:25px;"/>'
    }

    let content = '';
    let segs = sn.split(' ');
    for (let k in segs) {
        if (segs[k] == '') {
            continue;
        }
        if (segs[k] >= '0' && segs[k] <= '9') {
            content += '<div style="float:left">' + segs[k] + '</div>';
        } else if (segs[k] >= 'a' && segs[k] <= 'z') {
            content += '<div style="float:right">' + segs[k] + '</div>';
        }
    }

    return '<div style="clear:both"/><div class="span1" style="width:25px;">' + content + '</div>';
}

function renderEnDef_text(text) {
    text = text.replace(/{bc}/g, ':');
    text = text.replace(/{it}/g, '').replace(/{\/it}/g, '').replace(/{sc}/g, '').replace(/{\/sc}/g, '');
    //{dx}see {dxt|lamb|lamb|illustration}{/dx}
    text = text.replace(/{dx}.*{\/dx}/g, '');
    //{dx_def}see {dxt|disparate||1}{/dx_def} 
    text = text.replace(/{dx_def}.*{\/dx_def}/g, '');
    //{sx|oppose||}
    //{sx|introverted|introverted|}
    text = text.replace(/{sx\|(.*)\|.*\|.*}/g, function($0,$1) {return $0.replace($0, $1.toUpperCase());});
    //{a_link|tribute}
    text = text.replace(/{a_link\|([\w-]+)}/g, "$1");
    //:{d_link|initiated|initiate:1} 
    text = text.replace(/{d_link\|(.*)\|.*}/g, "$1");
    return '<div class="span7">' + text + '</div>';
}

function renderEnDef_vis(vis) {
    vis = vis.replace(/{it}/g, '<i>').replace(/{\/it}/g, '</i>');
    vis = vis.replace(/{wi}/g, '<i>').replace(/{\/wi}/g, '</i>');
    vis = '<span style="color: #08c">//' + vis + '</span>';
    return '<div class="span7">' + vis + '</div>';
}

function renderEnDef_element(element, sn) {
    if (element[0] == 'text') {
        return renderEnDef_sn(sn) + renderEnDef_text(element[1]);
    } else if (element[0] == 'vis') {
        let content = '';
        Object.keys(element[1]).forEach(function(i) {
            content += renderEnDef_sn('') + renderEnDef_vis(element[1][i]['t']);
        });
        return content;
    }
}

function renderEnDef_sense(sense) {
    let content = '';
    let sn = '';
    if (sense['sn'] != undefined) {
        sn = sense['sn'];
    }
    
    Object.keys(sense['dt']).forEach(function(k) {
        if (sense['dt'][k][0] == 'text' || sense['dt'][k][0] == 'vis') {
            content += renderEnDef_element(sense['dt'][k], sn);
        } else if (sense['dt'][k][0] == 'uns') {
            let uns = sense['dt'][k][1];
            Object.keys(uns).forEach(function(k) {
                Object.keys(uns[k]).forEach(function(i) {
                    if (uns[k][i][0] == 'text' || uns[k][i][0] == 'vis') {
                        content += renderEnDef_element(uns[k][i], sn);
                    }
                });
            });
        }
    });
    return content;
}

function renderEnDef_pseq(pseq) {
    let content = '';
    Object.keys(pseq).forEach(function(k){
        if (pseq[k][0] == 'sense') {
            content += renderEnDef_sense(pseq[k][1]);
        } else if (pseq[k][0] == 'bs') {
            content += renderEnDef_sense(pseq[k][1]['sense']);
        }
    });

    return content;
}

function renderEnDef_sseq(sseq) {
    let content = '';
    Object.keys(sseq).forEach(function(k) {
        Object.keys(sseq[k]).forEach(function(i) {
            if (sseq[k][i][0] == 'sense') {
                content += renderEnDef_sense(sseq[k][i][1]);
            } else if (sseq[k][i][0] == 'pseq') {
                content += renderEnDef_pseq(sseq[k][i][1]);
            } else if (sseq[k][i][0] == 'bs') {
                content += renderEnDef_sense(sseq[k][i][1]['sense']);
            }
        });
    });
    return content;
}

function renderEnDef_def(defJson) {
    let defContent = '';
    if (defJson['vd'] != undefined) {
        defContent += renderEnDef_vd(defJson['vd']);
    }
    if (defJson['sseq'] != undefined) {
        defContent += renderEnDef_sseq(defJson['sseq']);
    }
    return defContent;
}

function renderEnDef(json) {
    let htmlContent = '';
    Object.keys(json).forEach(function(k) {
        htmlContent += renderEnDef_fl(json[k]['fl']);

        Object.keys(json[k]['def']).forEach(function(key) {
            htmlContent += renderEnDef_def(json[k]['def'][key]);
        });
    });
    return htmlContent;
}