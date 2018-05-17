/*
 * <<
 * Davinci
 * ==
 * Copyright (C) 2016 - 2017 EDP
 * ==
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * >>
 */

import { takeLatest, takeEvery } from 'redux-saga'
import { call, fork, put } from 'redux-saga/effects'
import {
  LOAD_GROUPS,
  ADD_GROUP,
  DELETE_GROUP,
  // LOAD_GROUP_DETAIL,
  EDIT_GROUP
} from './constants'
import {
  groupsLoaded,
  loadGroupFail,
  groupAdded,
  addGroupFail,
  groupDeleted,
  deleteGroupFail,
  // groupDetailLoaded,
  groupEdited,
  editGroupFail
} from './actions'

const message = require('antd/lib/message')
import request from '../../utils/request'
import api from '../../utils/api'
import { promiseSagaCreator } from '../../utils/reduxPromisation'
import { writeAdapter, readListAdapter, readObjectAdapter } from '../../utils/asyncAdapter'

export function* getGroups () {
  try {
    const asyncData = yield call(request, api.group)
    const groups = readListAdapter(asyncData)
    yield put(groupsLoaded(groups))
  } catch (err) {
    yield put(loadGroupFail())
    message.error('加载 Group 列表失败')
  }
}

export function* addGroup ({ payload }) {
  try {
    const asyncData = yield call(request, {
      method: 'post',
      url: api.group,
      data: writeAdapter(payload.group)
    })
    const result = readObjectAdapter(asyncData)
    yield put(groupAdded(result))
    payload.resolve()
  } catch (err) {
    yield put(addGroupFail())
    message.error('新增失败')
  }
}

export function* deleteGroup ({ payload }) {
  try {
    yield call(request, {
      method: 'delete',
      url: `${api.group}/${payload.id}`
    })
    yield put(groupDeleted(payload.id))
  } catch (err) {
    yield put(deleteGroupFail())
    message.error('删除失败')
  }
}

// export const getGroupDetail = promiseSagaCreator(
//   function* (payload) {
//     const asyncData = yield call(request, `${api.group}/${payload.id}`)
//     const group = readObjectAdapter(asyncData)
//     yield put(groupDetailLoaded(group))
//     return group
//   },
//   function (err) {
//     console.log('getGroupDetail', err)
//   }
// )

export function* editGroup ({ payload }) {
  try {
    yield call(request, {
      method: 'put',
      url: api.group,
      data: writeAdapter(payload.group)
    })
    yield put(groupEdited(payload.group))
    payload.resolve()
  } catch (err) {
    yield put(editGroupFail())
    message.error('修改失败')
  }
}

export default function* rootGroupSaga (): IterableIterator<any> {
  yield [
    takeLatest(LOAD_GROUPS, getGroups),
    takeEvery(ADD_GROUP, addGroup as any),
    takeEvery(DELETE_GROUP, deleteGroup as any),
    // takeLatest(LOAD_GROUP_DETAIL, getGroupDetail),
    takeEvery(EDIT_GROUP, editGroup as any)
  ]
}
