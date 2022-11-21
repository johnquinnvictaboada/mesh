import { useEffect, useState } from 'react';
import Codeblock from '../../../ui/codeblock';
import Card from '../../../ui/card';
import RunDemoButton from '../../../common/runDemoButton';
import RunDemoResult from '../../../common/runDemoResult';
import SectionTwoCol from '../../../common/sectionTwoCol';
import useWallet from '../../../../contexts/wallet';
import ConnectCipWallet from '../../../common/connectCipWallet';
import Input from '../../../ui/input';
import Button from '../../../ui/button';
import { PlusCircleIcon, TrashIcon } from '@heroicons/react/24/solid';
import { demoAddresses } from '../../../../configs/demo';
import { Transaction } from '@martifylabs/mesh';

export default function DelegateStake() {
  const { wallet, walletConnected } = useWallet();
  const [userInput, setUserInput] = useState<string>(
    'pool13la5erny3srx9u4fz9tujtl2490350f89r4w4qjhk0vdjmuv78v'
  );

  // useEffect(() => {
  //   async function init() {
  //     const newRecipents = [
  //       {
  //         address:
  //           (await wallet.getNetworkId()) === 1
  //             ? demoAddresses.mainnet
  //             : demoAddresses.testnet,
  //         assets: {
  //           lovelace: 1000000,
  //         },
  //       },
  //     ];
  //     setUserInput(newRecipents);
  //   }
  //   if (walletConnected) {
  //     init();
  //   }
  // }, [walletConnected]);

  // function updateField(action, index, field, value) {
  //   let updated = [...userInput];
  //   if (action == 'add') {
  //     updated.push({ address: '', assets: { lovelace: 1000000 } });
  //   } else if (action == 'update') {
  //     if (field == 'address') {
  //       updated[index].address = value;
  //     } else if (field == 'lovelace') {
  //       if (value >= 1000000) {
  //         updated[index].assets.lovelace = value;
  //       }
  //     }
  //   } else if (action == 'remove') {
  //     updated.splice(index, 1);
  //   }
  //   setUserInput(updated);
  // }

  return (
    <SectionTwoCol
      sidebarTo="delegateStake"
      header="Delegate ADA to stakepool"
      leftFn={Left({ userInput })}
      rightFn={Right({ userInput, setUserInput })}
    />
  );
}

function Left({ userInput }) {
  let codeSnippet = `const tx = new Transaction({ initiator: wallet })\n`;
  // for (const recipient of userInput) {
  //   codeSnippet += `  .sendLovelace(\n`;
  //   codeSnippet += `    '${recipient.address}',\n`;
  //   codeSnippet += `    '${recipient.assets.lovelace}'\n`;
  //   codeSnippet += `  )\n`;
  // }
  codeSnippet += `;\n`;
  codeSnippet += `const unsignedTx = await tx.build();\n`;
  codeSnippet += `const signedTx = await wallet.signTx(unsignedTx);\n`;
  codeSnippet += `const txHash = await wallet.submitTx(signedTx);`;

  return (
    <>
      <p>
        You can chain the component to send to multiple recipients. For each
        recipients, append:
      </p>
      <Codeblock
        data={`tx.sendLovelace(address: string, lovelace: string);`}
        isJson={false}
      />
      <p>
        <code>.build()</code> construct the transaction and returns a
        transaction CBOR. Behind the scene, it selects necessary inputs
        belonging to the wallet, calculate the fee for this transaction and
        return remaining assets to the change address. Use{' '}
        <code>wallet.signTx()</code> to sign transaction CBOR.
      </p>
      <Codeblock data={codeSnippet} isJson={false} />
    </>
  );
}

function Right({ userInput, setUserInput }) {
  const [state, setState] = useState<number>(0);
  const [response, setResponse] = useState<null | any>(null);
  const [responseError, setResponseError] = useState<null | any>(null);
  const { wallet, walletConnected, hasAvailableWallets } = useWallet();

  async function runDemo() {
    setState(1);
    setResponseError(null);

    try {
      const rewardAddresses = await wallet.getRewardAddresses();
      const rewardAddress = rewardAddresses[0];

      const tx = new Transaction({ initiator: wallet });
      tx.delegateStake(rewardAddress, userInput);

      const unsignedTx = await tx.build();
      const signedTx = await wallet.signTx(unsignedTx);
      const txHash = await wallet.submitTx(signedTx);
      setResponse(txHash);
      setState(2);
    } catch (error) {
      setResponseError(`${JSON.stringify(error)}`);
      setState(0);
    }
  }

  return (
    <Card>
      {/* <InputTable userInput={userInput} setUserInput={setUserInput} /> */}
      <Input
        value={userInput}
        onChange={(e) => setUserInput(e.target.value)}
        placeholder="Pool ID"
        label="Pool ID"
      />
      {hasAvailableWallets && (
        <>
          {walletConnected ? (
            <>
              <RunDemoButton
                runDemoFn={runDemo}
                loading={state == 1}
                response={response}
              />
              <RunDemoResult response={response} />
            </>
          ) : (
            <ConnectCipWallet />
          )}
        </>
      )}
      <RunDemoResult response={responseError} label="Error" />
    </Card>
  );
}

// function InputTable({ userInput, setUserInput }) {
//   return (
//     <div className="overflow-x-auto relative">
//       <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400 m-0">
//         <caption className="p-5 text-lg font-semibold text-left text-gray-900 bg-white dark:text-white dark:bg-gray-800">
//           Send ADA to recipients
//           <p className="mt-1 text-sm font-normal text-gray-500 dark:text-gray-400">
//             Add or remove recipients, input the address and the amount ADA to
//             send.
//           </p>
//         </caption>
//         <thead className="thead">
//           <tr>
//             <th scope="col" className="py-3">
//               Recipients
//             </th>
//           </tr>
//         </thead>
//         <tbody>
//           {userInput.map((row, i) => {
//             return (
//               <tr
//                 className="bg-white border-b dark:bg-gray-800 dark:border-gray-700"
//                 key={i}
//               >
//                 <td>
//                   <div className="flex">
//                     <div className="flex-1 items-center pt-2">
//                       Recipient #{i + 1}
//                     </div>
//                     <div className="flex-none">
//                       <Button
//                         onClick={() => updateField('remove', i)}
//                         style="error"
//                       >
//                         <TrashIcon className="w-4 h-4" />
//                       </Button>
//                     </div>
//                   </div>
//                   <Input
//                     value={row.address}
//                     onChange={(e) =>
//                       setUserInput(e.target.value)
//                     }
//                     placeholder="Address"
//                     label="Address"
//                   />
//                   <Input
//                     value={row.assets.lovelace}
//                     type="number"
//                     onChange={(e) =>
//                       updateField('update', i, 'lovelace', e.target.value)
//                     }
//                     placeholder="Amount in Lovelace"
//                     label="Amount in Lovelace"
//                   />
//                 </td>
//               </tr>
//             );
//           })}
//           <tr>
//             <td colSpan={3}>
//               <Button onClick={() => updateField('add')}>
//                 <PlusCircleIcon className="m-0 mr-2 w-4 h-4" />
//                 Add recipient
//               </Button>
//             </td>
//           </tr>
//         </tbody>
//       </table>
//     </div>
//   );
// }
