import _ from 'lodash';
import {colors} from "@mui/material";

class EventEmitter {
    private readonly events: { [eventName: string]: Set<Function> };

    constructor() {
        this.events = {};
    }

    public on = (eventName: string, fn: Function): void => {
        this.getEventListByName(eventName).add(fn);
    }

    public once = (eventName: string, fn: Function): void => {
        const self = this;

        const onceFn = <T extends any[]>(...args: T): void => {
            self.removeListener(eventName, onceFn);
            fn.apply(self, args);
        };
        this.on(eventName, onceFn);
    }

    public emit = <T extends any[]>(eventName: string, ...args: T): void => {
        let eventNameList = this.getEventListByName(eventName);
        eventNameList.forEach((fn: Function) => {
            fn.apply(this, args);
        })
    }

    public removeListener = (eventName: string, fn: Function): void => {
        this.getEventListByName(eventName).delete(fn);
    }

    private getEventListByName = (eventName: string): any => {
        if (typeof this.events[eventName] === 'undefined') {
            this.events[eventName] = new Set<Function>();
        }

        return this.events[eventName];
    }
}

class MasraffUtils {
    public static searchInArray = (arr: any[], searchText: string): boolean => {
        for (let i = 0; i < arr.length; i += 1) {
            const value = arr[i];

            if (typeof value === 'string') {
                if (this.searchInString(value, searchText)) {
                    return true;
                }
            }

            if (typeof value === 'object') {
                if (this.searchInObj(value, searchText)) {
                    return true;
                }
            }
        }

        return false;
    }

    public static searchInString = (value: string, searchText: string): boolean => {
        return value.toLowerCase().includes(searchText);
    }

    public static searchInObj = (itemObj: any, searchText: string): boolean => {
        if (!itemObj)
            return false;

        const propArray = Object.keys(itemObj);

        for (let i = 0; i < propArray.length; i += 1) {
            const prop = propArray[i];
            const value = itemObj[prop];

            if (typeof value === 'string') {
                if (this.searchInString(value, searchText)) {
                    return true;
                }
            } else if (Array.isArray(value)) {
                if (this.searchInArray(value, searchText)) {
                    return true;
                }
            }

            if (typeof value === 'object') {
                if (this.searchInObj(value, searchText)) {
                    return true;
                }
            }
        }

        return false;
    }

    public static filterArrayByString = (mainArr: any[], searchText: string): any[] => {
        if (searchText === '') {
            return mainArr;
        }

        searchText = searchText.toLowerCase();

        return mainArr.filter((itemObj) => this.searchInObj(itemObj, searchText));
    }

    public static toggleInArray = (item: any, array: any[]): void => {
        const index = array.indexOf(item);
        if (index === -1) {
            array.push(item);
        } else {
            array.splice(index, 1);
        }
    }

    public static handleize = (text: string): string => {
        return text
            .toString()
            .toLowerCase()
            .replace(/\s+/g, '-') // Replace spaces with -
            .replace(/\W+/g, '') // Remove all non-word chars
            .replace(/--+/g, '-') // Replace multiple - with single -
            .replace(/^-+/, '') // Trim - from start of text
            .replace(/-+$/, ''); // Trim - from end of text
    }

    public static setRoutes = (config: any, defaultAuth: any): any[] => {
        let routes = [...config.routes];

        routes = routes.map((route) => {
            let auth = config.auth || config.auth === null ? config.auth : defaultAuth || null;
            auth = route.auth || route.auth === null ? route.auth : auth;
            const settings = _.merge({}, config.settings, route.settings);

            return {
                ...route,
                settings,
                auth,
            };
        });

        return [...routes];
    }

    public static generateRoutesFromConfigs = (configs: any[], defaultAuth: any): any[] => {
        let allRoutes: any[] = [];
        configs.forEach((config: any) => {
            allRoutes = [...allRoutes, ...this.setRoutes(config, defaultAuth)];
        });

        return allRoutes;
    }

    public static generateGUID = (): string => {
        const S4 = (): string => Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);

        return S4() + S4();
    }

    public static findById = (obj: any, id: any): any => {
        let i: number;
        let childObj: any;
        let result: any;

        if (id === obj.id)
            return obj;

        for (i = 0; i < Object.keys(obj).length; i += 1) {
            childObj = obj[Object.keys(obj)[i]];

            if (typeof childObj === 'object') {
                result = this.findById(childObj, id);
                if (result) {
                    return result;
                }
            }
        }

        return false;
    }

    public static getFlatNavigation = (navigationItems: any[], flatNavigation: any[] = []): any[] => {
        for (let i = 0; i < navigationItems.length; i += 1) {
            const navItem = navigationItems[i];

            if (navItem.type === 'item') {
                flatNavigation.push({
                    id: navItem.id,
                    title: navItem.title,
                    type: navItem.type,
                    icon: navItem.icon || false,
                    url: navItem.url,
                    auth: navItem.auth || null,
                });
            }

            if (navItem.type === 'collapse' || navItem.type === 'group') {
                if (navItem.children) {
                    this.getFlatNavigation(navItem.children, flatNavigation);
                }
            }
        }

        return flatNavigation;
    }

    public static randomMatColor = (hue: string): string => {
        const currentColors = colors as { [index: string]: any };
        hue = hue || '400';
        const mainColors = [
            'red',
            'pink',
            'purple',
            'deepPurple',
            'indigo',
            'blue',
            'lightBlue',
            'cyan',
            'teal',
            'green',
            'lightGreen',
            'lime',
            'yellow',
            'amber',
            'orange',
            'deepOrange',
        ];
        const randomColor = mainColors[Math.floor(Math.random() * mainColors.length)];

        return currentColors[randomColor][hue];
    }

    public static difference = (object: any, base: any): any => {
        const changes = (_object: any, _base: any): any => _.transform(_object, (result: any, value: any, key: any) => {
            if (!_.isEqual(value, _base[key])) {
                result[key] =
                    _.isObject(value) && _.isObject(_base[key]) ? changes(value, _base[key]) : value;
            }
        });

        return changes(object, base);
    }

    public static EventEmitter = EventEmitter;

    public static updateNavItem = (nav: any[], id: any, item: any): any[] => {
        return nav.map((_item: any) => {
            if (_item.id === id) {
                return _.merge({}, _item, item);
            }

            if (_item.children) {
                return _.merge({}, _item, {
                    children: this.updateNavItem(_item.children, id, item),
                });
            }

            return _.merge({}, _item);
        });
    }

    public static removeNavItem = (nav: any[], id: any): any[] => {
        return nav
            .map((_item: any) => {
                if (_item.id === id) {
                    return null;
                }

                if (_item.children) {
                    return _.merge({}, _.omit(_item, ['children']), {
                        children: this.removeNavItem(_item.children, id),
                    });
                }

                return _.merge({}, _item);
            })
            .filter((s) => s);
    }

    public static prependNavItem = (nav: any[], item: any, parentId: any): any[] => {
        if (!parentId) {
            return [item, ...nav];
        }

        return nav.map((_item: any) => {
            if (_item.id === parentId && _item.children) {
                return {
                    ..._item,
                    children: [item, ..._item.children],
                };
            }

            if (_item.children) {
                return _.merge({}, _item, {
                    children: this.prependNavItem(_item.children, item, parentId),
                });
            }

            return _.merge({}, _item);
        });
    }

    public static appendNavItem = (nav: any[], item: any, parentId: any): any[] => {
        if (!parentId) {
            return [...nav, item];
        }

        return nav.map((_item: any) => {
            if (_item.id === parentId && _item.children) {
                return {
                    ..._item,
                    children: [..._item.children, item],
                };
            }

            if (_item.children) {
                return _.merge({}, _item, {
                    children: this.appendNavItem(_item.children, item, parentId),
                });
            }

            return _.merge({}, _item);
        });
    }

    public static hasPermission = (authArr: any[], userRole: any): boolean => {
        if (authArr === null || authArr === undefined)
            return true;

        if (authArr.length === 0)
            return !userRole || userRole.length === 0;

        if (userRole && Array.isArray(userRole))
            return authArr.some((r) => userRole.indexOf(r) >= 0);

        return authArr.includes(userRole);
    }

    public static filterRecursive = (data: any[], predicate: (entry: any) => boolean): any[] | null => {
        return !data
            ? null
            : data.reduce((list: any[], entry: any) => {
                let clone: any = null;
                if (predicate(entry)) {
                    clone = {...entry};
                }
                if (entry.children != null) {
                    const children = this.filterRecursive(entry.children, predicate);
                    if (children && children.length > 0) {
                        clone = {...entry, children};
                    }
                }
                if (clone) {
                    list.push(clone);
                }
                return list;
            }, []);
    }
}

export default MasraffUtils;




