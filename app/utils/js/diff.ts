import { diff } from 'just-diff';
import _forEach from 'lodash-es/forEach';
import _get from 'lodash-es/get';
import _isPlainObject from 'lodash-es/isPlainObject';
import _isString from 'lodash-es/isString';
import _mapValues from 'lodash-es/mapValues';
import _pick from 'lodash-es/pick';
import { isEmail } from '@/utils/js';

function pickData(data: any, fields: string[]) {
  return _mapValues(_pick(data || {}, fields), (val, key) => {
    if (_isString(val) && isEmail(val)) return val.toLowerCase();
    return val;
  });
}

export interface DiffChange {
  op: 'replace' | 'add' | 'remove';
  path: (string | number)[];
  loc: string;
  oldVal: any;
  newVal: any;
  tag?: string;
}

export function diffExt<T = any>(data1: T, data2: T, fields: string[]) {
  const d1 = pickData(data1, fields);
  const d2 = pickData(data2, fields);
  const dffs = diff(d1, d2);

  const changes: DiffChange[] = [];

  for (const dff of dffs) {
    if (dff.op === 'replace') {
      changes.push({
        op: dff.op,
        path: dff.path,
        loc: dff.path.join('.'),
        oldVal: _get(d1, dff.path, null),
        newVal: dff.value,
      });
    } else if (dff.op === 'add') {
      if (_isPlainObject(dff.value)) {
        _forEach(dff.value, (val, key) => {
          const path = dff.path.concat(key);
          if (val) {
            changes.push({
              op: dff.op,
              path,
              loc: path.join('.'),
              oldVal: '',
              newVal: val,
            });
          }
        });
      } else {
        if (dff.value) {
          changes.push({
            op: dff.op,
            path: dff.path,
            loc: dff.path.join('.'),
            oldVal: '',
            newVal: dff.value,
          });
        }
      }
    } else if (dff.op === 'remove') {
      const value = _get(d1, dff.path, null);
      if (_isPlainObject(value)) {
        _forEach(value, (val, key) => {
          const path = dff.path.concat(key);
          changes.push({
            op: dff.op,
            path,
            loc: path.join('.'),
            oldVal: val,
            newVal: '',
          });
        });
      } else {
        changes.push({
          op: dff.op,
          path: dff.path,
          loc: dff.path.join('.'),
          oldVal: dff.value,
          newVal: '',
        });
      }
    }
  }

  const sortedChanges = changes.sort((a, b) => {
    const indexA = fields.indexOf(a.path[0].toString());
    const indexB = fields.indexOf(b.path[0].toString());
    return indexA - indexB;
  });

  return sortedChanges;
}
