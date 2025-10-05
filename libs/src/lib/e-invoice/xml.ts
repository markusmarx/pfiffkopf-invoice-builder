export interface XMLElement {
  id: string;
  tags?: [tagName: string, tagValue: string][];
  childs: (XMLElement | undefined)[] | string | number | undefined;
  forceKeep?: boolean;
}
export function renderXML(root: XMLElement | undefined): string {
  if (!root) {
    return '';
  }
  function renderNode(node: XMLElement | undefined, depth: string): string {
    if (!node) {
      return '';
    }
    if(!node.childs || node.childs instanceof Array && node.childs.length === 0){
      return `${depth}<${node.id}/>\n`
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
    if(node.childs === undefined || (node.childs instanceof Array && node.childs.length === 0 && !node.forceKeep)){
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
  childs?: (XMLElement | undefined)[] | string | number | undefined,
  tags?: [tagName: string, tagValue: string][],
  expectedChilds?: number
): XMLElement | undefined {
  if(childs instanceof Array){
    for(let i = childs.length -1; i >= 0; i--){
      if(!childs[i]){
        childs.splice(i, 1);
      }
    }
  }
  if (!childs || childs instanceof Array && childs.length === 0 || (expectedChilds && ((childs instanceof Array && childs.length !== expectedChilds) || !(childs instanceof Array)))) {
    return undefined;
  }
  return {
    id: id,
    tags: tags,
    childs: childs,
  };
}