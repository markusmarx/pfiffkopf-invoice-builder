export interface XMLElement {
  id: string;
  tags?: [tagName: string, tagValue: string][];
  childs: (XMLElement | undefined)[] | string | undefined;
}
export function renderXML(root: XMLElement | undefined): string {
  if (!root) {
    return '';
  }
  function renderNode(node: XMLElement | undefined, depth: string): string {
    if (!node) {
      return '';
    }
    const newDepth = depth + '\t';
    const tags = node.tags
      ? node.tags.map((tag) => ` ${tag[0]}="${tag[1]}"`).join('')
      : '';
    const childNodes =
      node.childs instanceof Array
        ? (node.childs as XMLElement[])
            .map((el) => {
              return renderNode(el, newDepth);
            })
            .join('')
        : (node.childs as string);
    return `${depth}<${node.id}${tags}>${node.childs instanceof Array ? `\n` : ''}${
      childNodes
    }${node.childs instanceof Array ? depth : ''}</${node.id}>\n`;
  }
  //flatten xml tree
  function flatten(node: XMLElement | undefined){
    if(!node){
      return undefined
    }
    if(node.childs instanceof Array){
      for(let i = 0; i < node.childs.length; i++){
        node.childs[i] = flatten(node.childs[i]);
      }
      node.childs = node.childs.filter((el) => el !== undefined);
    }
    if(node.childs === undefined || node.childs.length === 0){
      return undefined;
    }
    return node;
  }
  flatten(root);
  console.log(root);
  return `<?xml version="1.0" encoding="UTF-8"?>\n${renderNode(root, '')}`;
}
export function createXML(
  id: string,
  childs?: (XMLElement | undefined)[] | string | undefined,
  tags?: [tagName: string, tagValue: string][],
): XMLElement | undefined {
  if (!childs || childs.length === 0) {
    return undefined;
  }
  return {
    id: id,
    tags: tags,
    childs: childs,
  };
}