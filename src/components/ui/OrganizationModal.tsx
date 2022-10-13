import { TextInput, Text, Checkbox, Button, Group, Box, Modal, ColorPicker, ColorInput, Tabs, Select } from '@mantine/core';
import { useForm } from '@mantine/form';
interface OrganizationProps {
    open: boolean;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
    organizationOrCollection: string;
  }
export function OrganizationModal({open, setOpen, organizationOrCollection}:OrganizationProps) {
  const organizationForm = useForm({
    initialValues: {
      name: '',
      icon: '',
      color: '',
      accent: '',
    },

    validate: {
      name: (value) => (value ? null : 'Please enter a name'),
      icon: (value) => (value.length < 3 ? null : 'Please enter an icon/emoji'),
    },
  });

  const collectionForm = useForm({
    initialValues: {
      parent: '',
      name: '',
      color: '',
    },

    validate: {
      parent: (value) => (value ? null : 'Please pick a parent Organization'),
      name: (value) => (value ? null : 'Please enter a name'),
    },
  });

  return (
    <Modal opened={open} onClose={() => setOpen(false)} title={`Manage ${organizationOrCollection.charAt(0).toUpperCase()+organizationOrCollection.slice(1)}`}>
        <Tabs defaultValue={organizationOrCollection}>
            <Tabs.List grow>
                <Tabs.Tab value="organization" >Organization</Tabs.Tab>
                <Tabs.Tab value="collection" >Collection</Tabs.Tab>
            </Tabs.List>

            <Tabs.Panel value="organization" pt="xs">
            <Box px={20} pt={10} pb={20} mx="auto">
                <form onSubmit={organizationForm.onSubmit((values) => console.log(values))}>
                    <TextInput label="Name" placeholder='Name' {...organizationForm.getInputProps('name')} pb={20}/>
                    <TextInput label="Icon" placeholder='Icon' {...organizationForm.getInputProps('icon')} pb={20}/>
                    <Text weight={500} sx={{fontSize:14}} pb={5}>Organization Color</Text>
                    <ColorInput defaultValue="rgba(69, 122, 255, 1)" format="rgba" pb={20} {...organizationForm.getInputProps('color')}/>
                    <Text weight={500} sx={{fontSize:14}} pb={5}>Accent Color</Text>
                    <ColorInput defaultValue="rgba(69, 122, 255, 1)" format="rgba" pb={20} {...organizationForm.getInputProps('accent')}/>
                    
                    <Group position="right" mt="md">
                    <Button type="submit">Add Organization</Button>
                    </Group>
                </form>
            </Box>
            </Tabs.Panel>

            <Tabs.Panel value="collection" pt="xs">
                <Box px={20} pt={10} pb={20} mx="auto">
                    <form onSubmit={collectionForm.onSubmit((values) => console.log(values))}>
                        <Select
                            label="Parent Organization"
                            placeholder="Pick one" pb={20}
                            {...collectionForm.getInputProps('parent')}
                            data={[
                            ]}
                        />
                        <TextInput label="Name" placeholder='Name' {...collectionForm.getInputProps('name')} pb={20}/>
                        <Text weight={500} sx={{fontSize:14}} pb={5}>Organization Color</Text>
                        <ColorInput defaultValue="rgba(69, 122, 255, 1)" format="rgba" pb={20} {...collectionForm.getInputProps('color')}/>

                        <Group position="right" mt="md">
                        <Button type="submit">Add Collection</Button>
                        </Group>
                    </form>
                </Box>
            </Tabs.Panel>
        </Tabs>
    
    </Modal>
  );
}