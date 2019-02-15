/**
 * This parser from:
 * https://andrew.stwrt.ca/posts/js-xml-parsing/
 */
// import { isEmpty, isPlainObject, reduce, size, values, get } from 'lodash';
// import { each } from 'lodash/each';
// import _ from 'lodash/wrapperLodash';


// import each = require('lodash/each');
import each from 'lodash/each';
import has from 'lodash/has';
import isArray from 'lodash/isArray';
import isEmpty from 'lodash/isEmpty';
import isPlainObject from 'lodash/isPlainObject';
import reduce from 'lodash/reduce';
import size from 'lodash/size';
import values from 'lodash/values';
import get from 'lodash/get';







// flattens an object (recursively!), similarly to Array#flatten
// e.g. flatten({ a: { b: { c: "hello!" } } }); // => "hello!"
function flatten(object) {
    const check = isPlainObject(object) && size(object) === 1;
    return check ? flatten(values(object)[0]) : object;
}

export function parse(xml: any) {
    const data = {};

    const isText = xml.nodeType === 3,
        isElement = xml.nodeType === 1,
        body = xml.textContent && xml.textContent.trim(),
        hasChildren = xml.children && xml.children.length,
        hasAttributes = xml.attributes && xml.attributes.length;

    // if it's text just return it
    if (isText) {
        return xml.nodeValue.trim();
    }

    // if it doesn't have any children or attributes, just return the contents
    if (!hasChildren && !hasAttributes) {
        return body;
    }

    // if it doesn't have children but _does_ have body content, we'll use that
    //
    if (!hasChildren && body.length) {
        data['text'] = body;
    }

    // if it's an element with attributes, add them to data.attributes
    if (isElement && hasAttributes) {
        data['attributes'] = reduce(xml.attributes, function (obj, name, id) {
            const attr = xml.attributes.item(id);
            obj[attr.name] = attr.value;
            return obj;
        }, {});
    }

    // recursively call #parse over children, adding results to data
    each(xml.children, function (child) {
        const name = child.nodeName;

        // if we've not come across a child with this nodeType, add it as an object
        // and return here
        if (!has(data, name)) {
            data[name] = parse(child);
            return;
        }

        // if we've encountered a second instance of the same nodeType, make our
        // representation of it an array
        if (!isArray(data[name])) {
            data[name] = [data[name]];
        }

        // and finally, append the new child
        data[name].push(parse(child));
    });

    // if we can, let's fold some attributes into the body
    each(data['attributes'], function (value, key) {
        if (data[key] != null) {
            return;
        }
        data[key] = value;
        delete data['attributes'][key];
    });

    // if data['attributes'] is now empty, get rid of it
    if (isEmpty(data['attributes'])) {
        delete data['attributes'];
    }

    // simplify to reduce number of final leaf nodes and return
    return flatten(data);
}

export function parseRss(xmlText: string) {
    const XML = new DOMParser().parseFromString(xmlText, 'text/xml');
    const obj = parse(XML);
    return get(obj, 'channel.item') || [];
}
