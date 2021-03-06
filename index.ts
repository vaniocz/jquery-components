/// <reference path="jquery.d.ts"/>

declare global
{
    interface JQueryStatic {
        components: {[name: string]: JQueryComponentConstructor};
    }
}

interface JQueryComponentConstructor
{
    new (element: JQuery | HTMLElement | JQuery.Selector | any, options: any): any;
}

function convertToCamelCase(text: string): string
{
    return text.replace(/-([a-z])/g, (character: string) => character.charAt(1).toUpperCase());
}

function registerComponent($element: JQuery, name: string, options: any): void
{
    let Component = $.components[name];
    let components = $element.data('components') || {};

    if (components[name]) {
        return;
    }

    components[name] = new Component($element, options);
    $element.data('components', components);
}

if (!$.components) {
    $.components = {};
}

export function component(name: string)
{
    return (target: JQueryComponentConstructor) => {
        $.components[name] = target;
    }
}

export function register(root: JQuery | HTMLElement | JQuery.Selector): void
{
    root = $(root)[0] as HTMLElement;
    const elements = root.getElementsByTagName('*') as HTMLCollectionOf<HTMLElement>;

    for (let i = -1; i < elements.length; i++) {
        const element = i === -1 ? root : elements[i];

        for (let j = 0; j < element.attributes.length; j++) {
            const attribute = element.attributes[j];

            if (!attribute.specified || attribute.name.indexOf('data-component-') !== 0) {
                continue;
            }

            const name = convertToCamelCase(attribute.name.substr(14));

            if (!$.components || !$.components[name]) {
                continue;
            }

            let $element = $(element);
            registerComponent($element, name, $element.data(attribute.name.substr(5)));
        }
    }
}
