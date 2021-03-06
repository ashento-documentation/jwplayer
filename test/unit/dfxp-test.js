import dfxp from 'parsers/captions/dfxp';

describe('dfxp', function() {

    it('is a function', function () {
        expect(typeof dfxp, 'dfxp is a function').to.equal('function');
    });

    it('throws an error if the xml document is null', function () {
        try {
            dfxp(null);
        } catch (e) {
            expect(e.code).to.equal(306007);
        }
    });

    it('throws an error if the xml doc has no paragraphs', function () {
        try {
            parseDFXP('<?xml version="1.0" encoding="UTF-8"?><tt xmlns="http://www.w3.org/2006/10/ttaf1"><head></head><body><div></div></body></tt>');
        } catch (e) {
            expect(e.code).to.equal(306005);
        }
    });

    it('throws an error if the xml doc has no valid cues', function () {
        try {
            parseDFXP('<?xml version="1.0" encoding="UTF-8"?><tt xmlns="http://www.w3.org/2006/10/ttaf1"><head></head><body><div><p begin="00:00:31" end="00:00:33"></p></div></body></tt>');
        } catch (e) {
            expect(e.code).to.equal(306005);
        }
    });

    it('parses a valid xml doc', function() {
        const DFXP = '<?xml version="1.0" encoding="UTF-8"?><tt xmlns="http://www.w3.org/2006/10/ttaf1"><head></head><body><div><p begin="00:00:00.5" end="00:00:04">The Peach Open Movie Project presents</p><p begin="00:00:06.5" end="00:00:09">One big rabbit</p><p begin="00:00:11" end="00:00:13">Three rodents</p><p begin="00:00:16.5" end="00:00:19">And one giant payback</p><p begin="00:00:23" end="00:00:25">Get ready</p><p begin="00:00:27" end="00:00:30">Big Buck Bunny</p><p begin="00:00:30" end="00:00:31">Coming soon</p><p begin="00:00:31" end="00:00:33">www.bigbuckbunny.org<br/>Licensed as Creative Commons 3.0 attribution</p></div></body></tt>';

        // Do not run the test if inner HTML does not exist, as it will fail in phantomjs
        const p = parseXML(DFXP).getElementsByTagName('p');
        const innerXmlSupported = !!(p && p[0] && p[0].innerHTML);

        let captions = parseDFXP(DFXP);
        expect(captions.length, 'DXFP captions are parsed').to.equal(8);
        expect(captions[7].text.indexOf('www.bigbuckbunny.org'), 'Text is parsed').to.equal(0);
        expect(captions[7].text.indexOf('\r\n') > -1, 'Break elements are replaced by carriage returns and newlines').to.be.true;

        const DFXPns = '<?xml version="1.0" encoding="UTF-8"?><!-- v1.1 --><tt:tt xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:ttp="http://www.w3.org/ns/ttml#parameter" xmlns:tts="http://www.w3.org/ns/ttml#styling" xmlns:tt="http://www.w3.org/ns/ttml" xmlns:ebuttm="urn:ebu:tt:metadata" ttp:timeBase="media" xml:lang="de" ttp:cellResolution="50 30"><tt:body><tt:div><tt:p xml:id="subtitle1" region="bottom" begin="00:00:00.000" end="00:00:02.120" style="textCenter"><tt:span style="textWhite">wei?? auf schwarz, Abschnitt: eins</tt:span></tt:p></tt:div></tt:body></tt:tt>';
        captions = parseDFXP(DFXPns);
        expect(captions.length, 'Namespaced DXFP captions are parsed').to.equal(1);
        expect(captions[0].text.indexOf('schwarz') > -1, 'Text is parsed').to.be.true;
        expect(captions[0].text.indexOf('Abschnitt') > -1, 'Namespace prefixes are not removed from text content').to.be.true;
        if (innerXmlSupported) {
            expect(captions[0].text.indexOf('<span') > -1, 'Namespace prefixes are removed from opening tags').to.be.true;
            expect(captions[0].text.indexOf('</span') > -1, 'Namespace prefixes are removed from closing tags').to.be.true;
        }
    });

    function parseDFXP(xmlString) {
        const xmlDoc = parseXML(xmlString);
        return dfxp(xmlDoc);
    }

    function parseXML(input) {
        if (window.DOMParser) {
            const parser = new window.DOMParser();
            return parser.parseFromString(input, 'text/xml');
        }
        const xmlDom = new window.ActiveXObject('Microsoft.XMLDOM');
        xmlDom.async = 'false';
        xmlDom.loadXML(input);
        return xmlDom;
    }
});
