import type { QueryAllParams } from "../../../core/schema/QueryParams";
import type { NFT } from "../../../core/schema/nft";
import { detectContractFeature } from "../../common/feature-detection/detectContractFeature";
import { FEATURE_NFT_SUPPLY } from "../../constants/erc721-features";
import type { BaseERC721 } from "../../types/eips";
import { DetectableFeature } from "../interfaces/DetectableFeature";
import type { ContractWrapper } from "./contract-wrapper";
import type {
  IERC721Enumerable,
  IERC721Supply,
} from "@thirdweb-dev/contracts-js";
import { BigNumber, BigNumberish, constants } from "ethers";
import { DEFAULT_QUERY_ALL_COUNT } from "../../../core/schema/QueryParams";
import type { Erc721 } from "./erc-721";
import { Erc721Enumerable } from "./erc-721-enumerable";
import { Multicall, ContractCall } from "pilum";

/**
 * List ERC721 NFTs
 * @remarks Easily list all the NFTs in a ERC721 contract.
 * @example
 * ```javascript
 * const contract = await sdk.getContract("{{contract_address}}");
 * const nfts = await contract.nft.query.all();
 * ```
 * @public
 */

export class Erc721Supply implements DetectableFeature {
  featureName = FEATURE_NFT_SUPPLY.name;
  private contractWrapper: ContractWrapper<BaseERC721 & IERC721Supply>;
  private erc721: Erc721;
  private multicall: Multicall;

  public owned: Erc721Enumerable | undefined;

  constructor(
    erc721: Erc721,
    contractWrapper: ContractWrapper<BaseERC721 & IERC721Supply>,
  ) {
    this.erc721 = erc721;
    this.contractWrapper = contractWrapper;
    this.owned = this.detectErc721Owned();
    this.multicall = new Multicall({ provider: contractWrapper.getProvider() });
  }

  /**
   * Get all NFTs
   *
   * @remarks Get all the data associated with every NFT in this contract.
   *
   * By default, returns the first 100 NFTs, use queryParams to fetch more.
   *
   * @example
   * ```javascript
   * const nfts = await contract.nft.query.all();
   * ```
   * @param queryParams - optional filtering to only fetch a subset of results.
   * @returns The NFT metadata for all NFTs queried.
   */
  public async all(queryParams?: QueryAllParams): Promise<NFT[]> {
    const start = BigNumber.from(queryParams?.start || 0).toNumber();
    const count = BigNumber.from(
      queryParams?.count || DEFAULT_QUERY_ALL_COUNT,
    ).toNumber();

    const maxSupply = await this.erc721.nextTokenIdToMint();
    const maxId = Math.min(maxSupply.toNumber(), start + count);
    return await Promise.all(
      [...Array(maxId - start).keys()].map((i) =>
        this.erc721.get((start + i).toString()),
      ),
    );
  }

  /**
   * Return all the owners of each token id in this contract
   * @returns
   */
  public async allOwners(): Promise<
    { tokenId: BigNumberish; owner: string }[]
  > {
    let totalCount: BigNumber;

    // 1. Only look for the total claimed supply if the contract supports it
    try {
      totalCount = await this.erc721.totalClaimedSupply();
    } catch (e) {
      totalCount = await this.totalCount();
    }

    // 2. Use multicall3 if available
    try {
      const calls: ContractCall[] = [
        ...new Array(totalCount.toNumber()).keys(),
      ].map((i) => ({
        address: this.contractWrapper.readContract.address,
        method: "ownerOf",
        params: [i],
        abi: this.contractWrapper.abi as any[],
        value: 0,
        reference: `ownerOf(${i})`,
        allowFailure: true,
      }));
      const { results } = await this.multicall.call(calls);
      return results
        .filter((r) => r.returnData[0]) // filter out failures
        .map((r) => ({
          tokenId: r.params[0],
          owner:
            this.contractWrapper.readContract.interface.decodeFunctionResult(
              "ownerOf",
              r.returnData[1],
            )[0],
        }));
    } catch (e) {
      // 3. last resort, call ownerOf for each tokenId
      return (
        await Promise.all(
          [...new Array(totalCount.toNumber()).keys()].map(async (i) => ({
            tokenId: i,
            owner: await this.erc721
              .ownerOf(i)
              .catch(() => constants.AddressZero),
          })),
        )
      ).filter((o) => o.owner !== constants.AddressZero);
    }
  }

  /**
   * Get the number of NFTs minted
   * @remarks This returns the total number of NFTs minted in this contract, **not** the total supply of a given token.
   *
   * @returns the total number of NFTs minted in this contract
   * @public
   */
  public async totalCount(): Promise<BigNumber> {
    return await this.erc721.nextTokenIdToMint();
  }

  /**
   * Get the number of NFTs of this contract currently owned by end users
   * @returns the total number of NFTs of this contract in circulation (minted & not burned)
   * @public
   */
  public async totalCirculatingSupply(): Promise<BigNumber> {
    return await this.contractWrapper.readContract.totalSupply();
  }

  private detectErc721Owned(): Erc721Enumerable | undefined {
    if (
      detectContractFeature<BaseERC721 & IERC721Enumerable>(
        this.contractWrapper,
        "ERC721Enumerable",
      )
    ) {
      return new Erc721Enumerable(this.erc721, this.contractWrapper);
    }
    return undefined;
  }
}
