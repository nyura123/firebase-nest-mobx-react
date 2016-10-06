
export function incrementalGrouping({getGroupKeys, onUpdatedInGroup}) {
  return (objectKey, object, groups, objectCache) => {
    const prevObject = objectCache? objectCache[objectKey] : undefined;
    if (object) {
      const groupKeys = getGroupKeys(object);
      (groupKeys || []).forEach(groupKey => {
        if (!groups[groupKey]) groups[groupKey] = {objects: {}};
        groups[groupKey].objects[objectKey] = object;
        onUpdatedInGroup && onUpdatedInGroup(objectKey, object, prevObject, groupKey, groups[groupKey]);
      });
      objectCache[objectKey] = object;
    } else {
      if (prevObject) {
        const groupKeys = getGroupKeys(prevObject);
        (groupKeys || []).forEach(groupKey => {
          const group = groups ? groups[groupKey] : null;
          if (group && group.objects) {
            delete group.objects[objectKey];
            onUpdatedInGroup && onUpdatedInGroup(objectKey, null, prevObject, groupKey, group);
          }
        });
      }
      objectCache && delete objectCache[objectKey];
    }
  }
}