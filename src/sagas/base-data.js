import Api, { Transforms } from '_/ovirtapi'
import { put, select, all, call } from 'redux-saga/effects'
import {
  canUserUseTemplate,
  canUserUseCluster,
  canUserUseVnicProfile,
} from '_/utils'

import {
  callExternalAction,
  entityPermissionsToUserPermits,
  mapCpuOptions,
} from './utils'

import {
  setClusters,
  setHosts,
  setOperatingSystems,
  setTemplates,
  setUser,
  setUserGroups,
  setVnicProfiles,
} from '_/actions'

import { EVERYONE_GROUP_ID } from '_/constants'
import { fetchUnknownIcons } from './osIcons'

export function* fetchAllClusters () {
  const clusters = yield callExternalAction('getAllClusters', Api.getAllClusters)

  if (clusters && clusters.cluster) {
    const clustersInternal = clusters.cluster.map(
      cluster => Transforms.Cluster.toInternal({ cluster })
    )

    // Calculate permits and 'canUser*'
    for (const cluster of clustersInternal) {
      cluster.userPermits = yield entityPermissionsToUserPermits(cluster)
      cluster.canUserUseCluster = canUserUseCluster(cluster.userPermits)
    }

    // Map cluster attribute derived config values to the clusters
    for (const cluster of clustersInternal) {
      cluster.cpuOptions = yield mapCpuOptions(cluster.version, cluster.architecture)
    }

    yield put(setClusters(clustersInternal))
  }
}

export function* fetchAllHosts () {
  const hosts = yield callExternalAction('getAllHosts', Api.getAllHosts)

  if (hosts && hosts.host) {
    const hostsInternal = hosts.host.map(
      host => Transforms.Host.toInternal({ host })
    )

    yield put(setHosts(hostsInternal))
  }
}

export function* fetchAllOS () {
  const operatingSystems = yield callExternalAction('getAllOperatingSystems', Api.getAllOperatingSystems)

  if (operatingSystems && operatingSystems.operating_system) {
    const operatingSystemsInternal = operatingSystems.operating_system.map(
      os => Transforms.OS.toInternal({ os })
    )

    yield put(setOperatingSystems(operatingSystemsInternal))
    yield fetchUnknownIcons({ os: operatingSystemsInternal }) // load icons for OS
  }
}

export function* fetchAllTemplates () {
  const templates = yield callExternalAction('getAllTemplates', Api.getAllTemplates)

  if (templates && templates.template) {
    const templatesInternal = templates.template.map(
      template => Transforms.Template.toInternal({ template })
    )

    // Calculate permits and 'canUser*'
    for (const template of templatesInternal) {
      template.userPermits = yield entityPermissionsToUserPermits(template)
      template.canUserUseTemplate = canUserUseTemplate(template.userPermits)
    }

    // Map template attribute derived config values to the templates
    for (const template of templatesInternal) {
      const customCompatVer = template.customCompatibilityVersion

      template.cpuOptions = customCompatVer
        ? yield mapCpuOptions(customCompatVer, template.cpu.arch)
        : null
    }

    yield put(setTemplates(templatesInternal))
  }
}

export function* fetchAllVnicProfiles () {
  const vnicProfiles = yield callExternalAction('getAllVnicProfiles', Api.getAllVnicProfiles)

  if (vnicProfiles && vnicProfiles.vnic_profile) {
    const vnicProfilesInternal = vnicProfiles.vnic_profile.map(
      vnicProfile => Transforms.VNicProfile.toInternal({ vnicProfile })
    )

    // Calculate permits and 'canUser*'
    for (const vnicProfile of vnicProfilesInternal) {
      vnicProfile.userPermits = yield entityPermissionsToUserPermits(vnicProfile)
      vnicProfile.canUserUseProfile = canUserUseVnicProfile(vnicProfile.userPermits)
    }

    yield put(setVnicProfiles({ vnicProfiles: vnicProfilesInternal }))
  }
}

export function* fetchCurrentUser () {
  const userId = yield select((state) => state.config.getIn(['user', 'id']))
  const user = yield callExternalAction('user', Api.user, {
    payload: {
      userId,
    },
  })

  yield put(setUser({ user: Transforms.User.toInternal({ user }) }))
}

/**
 * Fetch the user's ovirt known groups by fetching and cross referencing the users's
 * domain groups with the ovirt known groups.  Permission checks require ovirt group
 * uuids, not the domain entity ids.
 *
 * Users can belong to more domain groups than ovirt groups.  The ovirt group fetch will
 * return all groups the user can SEE but does not contain any membership information.
 * The cross reference will turn domain groups membership into ovirt group membership.
 * ovirt group uuids are stored in state.
 */
export function* fetchUserGroups () {
  const userId = yield select(state => state.config.getIn(['user', 'id']))

  const {
    domainGroups,
    ovirtGroups,
  } = yield all({
    domainGroups: call(function* (userId) {
      const { group: groups = [] } = yield callExternalAction('userDomainGroups', Api.userDomainGroups, { payload: { userId } })
      return groups.map(group => group.id)
    }, userId),

    ovirtGroups: call(function* () {
      const { group: groups = [] } = yield callExternalAction('groups', Api.groups)
      return groups.map(group => ({
        domainEntryId: group.domain_entry_id,
        ovirtId: group.id,
      }))
    }),
  })

  // Cross reference domainGroups with ovirtGroups to hold on to ovirt group
  // ids that the user is a member of
  const groupIds = []
  groupIds.push(EVERYONE_GROUP_ID)

  ovirtGroups.forEach(ovirtGroup => {
    if (domainGroups.includes(ovirtGroup.domainEntryId)) {
      groupIds.push(ovirtGroup.ovirtId)
    }
  })

  yield put(setUserGroups({ groups: groupIds }))
}
