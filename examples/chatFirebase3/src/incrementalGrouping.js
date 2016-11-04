
export function incrementalGrouping({getGroupKeys, onUpdatedInGroup}) {
  return (objectKey, object, groups, objectCache) => {
    const prevObject = objectCache? objectCache[objectKey] : undefined;

    const newGroupKeys = object ? getGroupKeys(object) : [];
    const newGroupKeysObj = (newGroupKeys || []).reduce((obj, key) => {return {...obj, [key]:1} }, {});

    //Store object under each new group key
    if (object) {
      (newGroupKeys || []).forEach(groupKey => {
        if (!groups[groupKey]) groups[groupKey] = {objects: {}};
        groups[groupKey].objects[objectKey] = object;
        onUpdatedInGroup && onUpdatedInGroup(objectKey, object, prevObject, groupKey, groups[groupKey]);
      });
    }

    //Remove object from old group keys
    if (prevObject) {
      const oldGroupKeys = getGroupKeys(prevObject);
      (oldGroupKeys || []).forEach(groupKey => {
        const group = groups ? groups[groupKey] : null;
        if (group && group.objects && !newGroupKeysObj[groupKey]) {
          delete group.objects[objectKey];
          if (Object.keys(group).length == 0) {
            delete groups[groupKey];
          }
          onUpdatedInGroup && onUpdatedInGroup(objectKey, null, prevObject, groupKey, group);
        }
      });
    }

    if (object) {
      objectCache[objectKey] = object;
    } else {
      delete objectCache[objectKey];
    }
  }
}