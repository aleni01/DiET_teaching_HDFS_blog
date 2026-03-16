export const BLOCK_SIZES = [
  { label: '1 KB', value: 1024 },
  { label: '1 MB', value: 1024 * 1024 },
  { label: '128 MB', value: 128 * 1024 * 1024 },
  { label: '1 GB', value: 1024 * 1024 * 1024 },
  { label: '1 TB', value: 1024 * 1024 * 1024 * 1024 },
];

export const FILE_SIZE_STEPS = [
  { label: '1 GB', value: 1024 * 1024 * 1024 },
  { label: '10 GB', value: 10 * 1024 * 1024 * 1024 },
  { label: '50 GB', value: 50 * 1024 * 1024 * 1024 },
  { label: '100 GB', value: 100 * 1024 * 1024 * 1024 },
  { label: '250 GB', value: 250 * 1024 * 1024 * 1024 },
  { label: '500 GB', value: 500 * 1024 * 1024 * 1024 },
  { label: '750 GB', value: 750 * 1024 * 1024 * 1024 },
  { label: '1 TB', value: 1024 * 1024 * 1024 * 1024 },
];

export const METADATA_PER_BLOCK = 150; // bytes
export const DATANODE_CAPACITY = 100; // max blocks per DN

export const FILE_HUES = [0, 120, 220, 280]; // Red, Green, Blue, Purple
