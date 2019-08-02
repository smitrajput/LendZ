export const DAI2ETHABI = {
  1: [
    {
      constant: false,
      inputs: [{ name: 'owner_', type: 'address' }],
      name: 'setOwner',
      outputs: [],
      payable: false,
      type: 'function'
    },
    {
      constant: false,
      inputs: [{ name: '', type: 'bytes32' }],
      name: 'poke',
      outputs: [],
      payable: false,
      type: 'function'
    },
    {
      constant: false,
      inputs: [],
      name: 'poke',
      outputs: [],
      payable: false,
      type: 'function'
    },
    {
      constant: true,
      inputs: [],
      name: 'compute',
      outputs: [{ name: '', type: 'bytes32' }, { name: '', type: 'bool' }],
      payable: false,
      type: 'function'
    },
    {
      constant: false,
      inputs: [{ name: 'wat', type: 'address' }],
      name: 'set',
      outputs: [],
      payable: false,
      type: 'function'
    },
    {
      constant: false,
      inputs: [{ name: 'wat', type: 'address' }],
      name: 'unset',
      outputs: [],
      payable: false,
      type: 'function'
    },
    {
      constant: true,
      inputs: [{ name: '', type: 'address' }],
      name: 'indexes',
      outputs: [{ name: '', type: 'bytes12' }],
      payable: false,
      type: 'function'
    },
    {
      constant: true,
      inputs: [],
      name: 'next',
      outputs: [{ name: '', type: 'bytes12' }],
      payable: false,
      type: 'function'
    },
    {
      constant: true,
      inputs: [],
      name: 'read',
      outputs: [{ name: '', type: 'bytes32' }],
      payable: false,
      type: 'function'
    },
    {
      constant: true,
      inputs: [],
      name: 'peek',
      outputs: [{ name: '', type: 'bytes32' }, { name: '', type: 'bool' }],
      payable: false,
      type: 'function'
    },
    {
      constant: true,
      inputs: [{ name: '', type: 'bytes12' }],
      name: 'values',
      outputs: [{ name: '', type: 'address' }],
      payable: false,
      type: 'function'
    },
    {
      constant: false,
      inputs: [{ name: 'min_', type: 'uint96' }],
      name: 'setMin',
      outputs: [],
      payable: false,
      type: 'function'
    },
    {
      constant: false,
      inputs: [{ name: 'authority_', type: 'address' }],
      name: 'setAuthority',
      outputs: [],
      payable: false,
      type: 'function'
    },
    {
      constant: true,
      inputs: [],
      name: 'owner',
      outputs: [{ name: '', type: 'address' }],
      payable: false,
      type: 'function'
    },
    {
      constant: false,
      inputs: [],
      name: 'void',
      outputs: [],
      payable: false,
      type: 'function'
    },
    {
      constant: false,
      inputs: [
        { name: 'pos', type: 'bytes12' },
        { name: 'wat', type: 'address' }
      ],
      name: 'set',
      outputs: [],
      payable: false,
      type: 'function'
    },
    {
      constant: true,
      inputs: [],
      name: 'authority',
      outputs: [{ name: '', type: 'address' }],
      payable: false,
      type: 'function'
    },
    {
      constant: false,
      inputs: [{ name: 'pos', type: 'bytes12' }],
      name: 'unset',
      outputs: [],
      payable: false,
      type: 'function'
    },
    {
      constant: false,
      inputs: [{ name: 'next_', type: 'bytes12' }],
      name: 'setNext',
      outputs: [],
      payable: false,
      type: 'function'
    },
    {
      constant: true,
      inputs: [],
      name: 'min',
      outputs: [{ name: '', type: 'uint96' }],
      payable: false,
      type: 'function'
    },
    {
      anonymous: true,
      inputs: [
        { indexed: true, name: 'sig', type: 'bytes4' },
        { indexed: true, name: 'guy', type: 'address' },
        { indexed: true, name: 'foo', type: 'bytes32' },
        { indexed: true, name: 'bar', type: 'bytes32' },
        { indexed: false, name: 'wad', type: 'uint256' },
        { indexed: false, name: 'fax', type: 'bytes' }
      ],
      name: 'LogNote',
      type: 'event'
    },
    {
      anonymous: false,
      inputs: [{ indexed: true, name: 'authority', type: 'address' }],
      name: 'LogSetAuthority',
      type: 'event'
    },
    {
      anonymous: false,
      inputs: [{ indexed: true, name: 'owner', type: 'address' }],
      name: 'LogSetOwner',
      type: 'event'
    }
  ],
  42: [
    {
      constant: false,
      inputs: [],
      name: 'stop',
      outputs: [],
      payable: false,
      stateMutability: 'nonpayable',
      type: 'function'
    },
    {
      constant: true,
      inputs: [],
      name: 'peep',
      outputs: [{ name: '', type: 'bytes32' }, { name: '', type: 'bool' }],
      payable: false,
      stateMutability: 'view',
      type: 'function'
    },
    {
      constant: false,
      inputs: [{ name: 'owner_', type: 'address' }],
      name: 'setOwner',
      outputs: [],
      payable: false,
      stateMutability: 'nonpayable',
      type: 'function'
    },
    {
      constant: false,
      inputs: [],
      name: 'poke',
      outputs: [],
      payable: false,
      stateMutability: 'nonpayable',
      type: 'function'
    },
    {
      constant: true,
      inputs: [],
      name: 'src',
      outputs: [{ name: '', type: 'address' }],
      payable: false,
      stateMutability: 'view',
      type: 'function'
    },
    {
      constant: true,
      inputs: [],
      name: 'read',
      outputs: [{ name: '', type: 'bytes32' }],
      payable: false,
      stateMutability: 'view',
      type: 'function'
    },
    {
      constant: true,
      inputs: [],
      name: 'peek',
      outputs: [{ name: '', type: 'bytes32' }, { name: '', type: 'bool' }],
      payable: false,
      stateMutability: 'view',
      type: 'function'
    },
    {
      constant: true,
      inputs: [],
      name: 'stopped',
      outputs: [{ name: '', type: 'bool' }],
      payable: false,
      stateMutability: 'view',
      type: 'function'
    },
    {
      constant: false,
      inputs: [{ name: 'authority_', type: 'address' }],
      name: 'setAuthority',
      outputs: [],
      payable: false,
      stateMutability: 'nonpayable',
      type: 'function'
    },
    {
      constant: true,
      inputs: [],
      name: 'owner',
      outputs: [{ name: '', type: 'address' }],
      payable: false,
      stateMutability: 'view',
      type: 'function'
    },
    {
      constant: true,
      inputs: [],
      name: 'zzz',
      outputs: [{ name: '', type: 'uint64' }],
      payable: false,
      stateMutability: 'view',
      type: 'function'
    },
    {
      constant: true,
      inputs: [],
      name: 'pass',
      outputs: [{ name: 'ok', type: 'bool' }],
      payable: false,
      stateMutability: 'view',
      type: 'function'
    },
    {
      constant: false,
      inputs: [],
      name: 'void',
      outputs: [],
      payable: false,
      stateMutability: 'nonpayable',
      type: 'function'
    },
    {
      constant: true,
      inputs: [],
      name: 'hop',
      outputs: [{ name: '', type: 'uint16' }],
      payable: false,
      stateMutability: 'view',
      type: 'function'
    },
    {
      constant: false,
      inputs: [],
      name: 'start',
      outputs: [],
      payable: false,
      stateMutability: 'nonpayable',
      type: 'function'
    },
    {
      constant: true,
      inputs: [],
      name: 'authority',
      outputs: [{ name: '', type: 'address' }],
      payable: false,
      stateMutability: 'view',
      type: 'function'
    },
    {
      constant: false,
      inputs: [{ name: 'ts', type: 'uint16' }],
      name: 'step',
      outputs: [],
      payable: false,
      stateMutability: 'nonpayable',
      type: 'function'
    },
    {
      inputs: [{ name: 'src_', type: 'address' }],
      payable: false,
      stateMutability: 'nonpayable',
      type: 'constructor'
    },
    {
      anonymous: false,
      inputs: [{ indexed: false, name: 'val', type: 'bytes32' }],
      name: 'LogValue',
      type: 'event'
    },
    {
      anonymous: false,
      inputs: [{ indexed: true, name: 'authority', type: 'address' }],
      name: 'LogSetAuthority',
      type: 'event'
    },
    {
      anonymous: false,
      inputs: [{ indexed: true, name: 'owner', type: 'address' }],
      name: 'LogSetOwner',
      type: 'event'
    },
    {
      anonymous: true,
      inputs: [
        { indexed: true, name: 'sig', type: 'bytes4' },
        { indexed: true, name: 'guy', type: 'address' },
        { indexed: true, name: 'foo', type: 'bytes32' },
        { indexed: true, name: 'bar', type: 'bytes32' },
        { indexed: false, name: 'wad', type: 'uint256' },
        { indexed: false, name: 'fax', type: 'bytes' }
      ],
      name: 'LogNote',
      type: 'event'
    }
  ]
}
